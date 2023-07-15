const router = require('express').Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/', getUsers);

router.post('/', createUser);

router.get('/:id', getUser);

router.patch('/me', updateUserInfo);

router.patch('/me/avatar', updateUserAvatar);

module.exports = router;
