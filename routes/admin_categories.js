const express = require('express');
var router = express.Router();

var Category = require('./../models/category');
// "/admin/pages"

// GET pages index
router.get('/', (req,res) => {
  Category.find(function(err,categories) {
    if(err) return console.log(err);

    res.render('admin/categories', {categories});
  });

});

router.get('/add-category', (req,res) => {
  var title = '';

  res.render('admin/add_category', {title});
});

router.post('/add-category', (req,res) => {
  console.log('add category');
  req.checkBody('title', 'Title must have a value.').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();

  var errors = req.validationErrors();

  if(errors) {
    return res.render('admin/add_category', {errors,title});
  }else{
    Category.findOne({slug}, (err,category) => {
      if(category) {
        req.flash('danger', 'Category title exists, choose another one.');
        res.render('admin/add_category', {title});
      }else{
        var category = new Category({title,slug});
        category.save((err) => {
          if(err) {
            return console.log(err);
          }
          req.flash('success', 'Category added!');
          res.redirect('/admin/categories');
        });
      }
    });
  }
});

// GET edit page
router.get('/edit-category/:id', (req,res) => {
  Category.findById(req.params.id, (err,category) => {
    if(err) return console.log(err);

    res.render('admin/edit_category', {
      title:category.title,
      id:category._id
    });
  });

});

// POST edit page
router.post('/edit-category/:id', (req,res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var id = req.params.id;


  var errors = req.validationErrors();

  if(errors) {
    return res.render('admin/edit_category', {errors,title,id});
  }else{
    console.log('id: ', id);
    Category.findOne({slug, _id:{'$ne':id}}, (err,category) => {
      if(category) {
        req.flash('danger', 'Category title exists, choose another one.');
        res.render('admin/edit_category', {title,id});
      }else{
        Category.findById(id, (err,category) => {
          console.log('**** Error: ', err);
          console.log('**** Category: ', category);
          console.log(id);
          if(err) return console.log(err);
          category.title = title;
          category.slug= slug;

          category.save((err) => {
            if(err) {
              return console.log(err);
            }
            req.flash('success', 'Category edited!');
            res.redirect('/admin/categories/edit-category/'+id);
          });
        });

      }
    });
  }
});

// GET delete page
router.get('/delete-page/:id', (req,res) => {
  Page.findByIdAndRemove(req.params.id, (err) => {
    if(err) return console.log(err);

    req.flash('success', 'Page deleted!');
    res.redirect('/admin/pages/');

  });

});

module.exports = router;
