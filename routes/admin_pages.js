const express = require('express');
var router = express.Router();

var Page = require('./../models/page');
// "/admin/pages"

// GET pages index
router.get('/', (req,res) => {
  Page.find({}).sort({sorting: 1}).exec((err,pages) => {
    res.render('admin/pages', {pages});
  });

});

// GET add page
router.get('/add-page', (req,res) => {
  var title = '';
  var slug = '';
  var content = '';

  res.render('admin/add_page', {title,slug,content});
});

// POST add page
router.post('/add-page', (req,res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug == "") {
    var slug = title.replace(/\s+/g, '-').toLowerCase();
  }
  var content = req.body.content;

  var errors = req.validationErrors();


  if(errors) {
    return res.render('admin/add_page', {errors,title,slug,content});
  }else{
    Page.findOne({slug}, (err,page) => {
      if(page) {
        req.flash('danger', 'Page slug exists, choose another one.');
        res.render('admin/add_page', {title,slug,content});
      }else{
        var page = new Page({title,slug,content, sorting:0});
        page.save((err) => {
          if(err) {
            return console.log(err);
          }
          req.flash('success', 'Page added!');
          res.redirect('/admin/pages');
        });
      }
    });
  }
});


// POST reorder index
router.post('/reorder-pages', (req,res) => {
  var ids = req.body['id[]'];

  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    ((count) => {

      Page.findById(id,function(err,page){
        page.sorting = count;
        page.save(function (err) {
          if (err) {
            return console.log(err);
          }
        });
      });

    })(count);

  }
});

// GET edit page
router.get('/edit-page/:slug', (req,res) => {
  Page.findOne({slug:req.params.slug}, (err,page) => {
    if(err) return console.log(err);

    res.render('admin/edit_page', {
      title:page.title,
      slug:page.slug,
      content:page.content,
      id:page._id
    });
  });

});


// POST edit page
router.post('/edit-page/:id', (req,res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug == "") {
    var slug = title.replace(/\s+/g, '-').toLowerCase();
  }
  var content = req.body.content;
  var id = req.body.id;

  var errors = req.validationErrors();


  if(errors) {
    return res.render('admin/edit_page', {errors,title,slug,content,id});
  }else{
    console.log('id: ', id);
    Page.findOne({slug, _id:{'$ne':id}}, (err,page) => {
      if(page) {
        req.flash('danger', 'Page slug exists, choose another one.');
        res.render('admin/edit_page', {title,slug,content,id});
      }else{
        Page.findById(id, (err,page) => {
            if(err) return console.log(err);

            page.title = title;
            page.slug= slug;
            page.content= content;

            page.save((err) => {
              if(err) {
                return console.log(err);
              }
              req.flash('success', 'Page edited!');
              res.redirect('/admin/pages/edit-page/'+page.slug);
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
