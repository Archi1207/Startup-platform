const Deal = require('../models/Deal');
const Claim = require('../models/Claim');

exports.getAllDeals = async (req, res) => {
  try {
    const { 
      category, 
      accessLevel, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = { isActive: true };
    
    // Apply filters
    if (category) query.category = category;
    if (accessLevel) query.accessLevel = accessLevel;
    
    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const [deals, total] = await Promise.all([
      Deal.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Deal.countDocuments(query)
    ]);

    // Determine if deal is claimed by current user
    const dealsWithClaimStatus = await Promise.all(
      deals.map(async (deal) => {
        if (!req.user) {
          return { ...deal.toObject(), isClaimed: false };
        }
        
        const claim = await Claim.findOne({
          user: req.user._id,
          deal: deal._id
        });
        
        return {
          ...deal.toObject(),
          isClaimed: !!claim,
          claimStatus: claim?.status
        };
      })
    );

    res.json({
      success: true,
      data: dealsWithClaimStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal || !deal.isActive) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check if user can access this deal
    if (deal.accessLevel === 'verified' && (!req.user || !req.user.isVerified)) {
      return res.status(403).json({ 
        error: 'Verification required to view this deal',
        requiresVerification: true 
      });
    }

    let isClaimed = false;
    let claimStatus = null;

    if (req.user) {
      const claim = await Claim.findOne({
        user: req.user._id,
        deal: deal._id
      });
      isClaimed = !!claim;
      claimStatus = claim?.status;
    }

    res.json({
      success: true,
      data: {
        ...deal.toObject(),
        isClaimed,
        claimStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.claimDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal || !deal.isActive) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check access level
    if (deal.accessLevel === 'verified' && !req.user.isVerified) {
      return res.status(403).json({ 
        error: 'Verification required to claim this deal',
        requiresVerification: true 
      });
    }

    // Check if already claimed
    const existingClaim = await Claim.findOne({
      user: req.user._id,
      deal: deal._id
    });

    if (existingClaim) {
      return res.status(400).json({ error: 'Deal already claimed' });
    }

    // Check max claims
    if (deal.maxClaims && deal.claimCount >= deal.maxClaims) {
      return res.status(400).json({ error: 'Deal claims exhausted' });
    }

    // Create claim
    const claim = await Claim.create({
      user: req.user._id,
      deal: deal._id,
      status: 'pending',
      expiresAt: deal.validity ? new Date(deal.validity) : null
    });

    // Increment claim count
    deal.claimCount += 1;
    await deal.save();

    res.status(201).json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ user: req.user._id })
      .sort({ claimedAt: -1 })
      .populate('deal', 'title partnerName category discount');

    res.json({
      success: true,
      data: claims
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};