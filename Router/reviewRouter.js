//review router

const express =require('express');
const router=express.Router();
const { createReview, reviewView, reviewSingleView, deleteReview, editReview } =require('../Controllers/reviewsController');

router.post('/createreview',createReview);
router.get('/reviewview',reviewView);
router.get('/reviewview/:id',reviewSingleView);
router.put('/reviewedit/:id',editReview);
router.delete('/reviewdelete/:id',deleteReview);

module.exports=router;