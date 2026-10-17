const express = require('express');
const router = express.Router();


const {auth , isAdmin} = require('../middleware/auth');

const { updateUserStatus,getAllUsers } = require('../controllers/admin.controller');


router.patch('/:userId/status', auth, isAdmin , updateUserStatus);

router.get('/users', auth,isAdmin, getAllUsers);
// http://localhost:5000/api/admin/users?page=3&limit=10

module.exports = router