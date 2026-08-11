const VendorApplication = require('../models/vendorApplication.model');

const createVendorApplication = async (req, res) => {
    try{

    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
