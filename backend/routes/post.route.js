import express from 'express'
import { addNewPost, getAllPosts, getPostById, getCurrentUserPosts, getOtherUserPosts, likePost, addComment, deleteComment, getCommentsOfPost, deletePost, deleteAllPostsOfCurrentUser, deleteAllPosts, bookmarkPost } from '../controllers/post.controller.js'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import upload from '../middlewares/multer.js'

const router = express.Router();

router.route('/addNewPost').post(isAuthenticated, upload.single('image'), addNewPost);
router.route('/getAllPosts').get(isAuthenticated, getAllPosts);
router.route('/getPostById/:id').get(isAuthenticated, getPostById);
router.route('/getCurrentUserPosts').get(isAuthenticated, getCurrentUserPosts);
router.route('/getOtherUserPosts').get(isAuthenticated, getOtherUserPosts);
router.route('/likePost/:id').get(isAuthenticated, likePost);
router.route('/deletePost/:id').get(isAuthenticated, deletePost);
router.route('/deleteAllPostsOfCurrentUser').get(isAuthenticated, deleteAllPostsOfCurrentUser);
router.route('/deleteAllPosts').get(isAuthenticated, deleteAllPosts);
router.route('/:id/addComment').post(isAuthenticated, addComment);
router.route('/comment/delete/:id').get(isAuthenticated, deleteComment);
router.route('/:id/comment/all').get(isAuthenticated, getCommentsOfPost);
router.route('/:id/bookmarkPost').get(isAuthenticated, bookmarkPost);

export default router;