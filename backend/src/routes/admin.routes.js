const express = require('express');
const router = express.Router();


const {auth , isAdmin} = require('../middleware/auth');

const { updateUserStatus } = require('../controllers/admin.controller');


router.patch('/:userId/status', auth, isAdmin , updateUserStatus);

module.exports = router;