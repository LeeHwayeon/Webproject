const express = require('express');
const Event = require('../models/event');
const Register = require('../models/register'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET events listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}},
      {location: {'$regex': term, '$options': 'i'}},
      {stdate: {'$regex': term, '$options': 'i'}},
      {endate: {'$regex': term, '$options': 'i'}},
      {image: {'$regex': term, '$options': 'i'}},
      {sttime: {'$regex': term, '$options': 'i'}},
      {endtime: {'$regex': term, '$options': 'i'}},
      {freeticket: {'$regex': term, '$options': 'i'}},
      {paidticket: {'$regex': term, '$options': 'i'}},
      {price: {'$regex': term, '$options': 'i'}},      
      {organization: {'$regex': term, '$options': 'i'}},
      {orcontent: {'$regex': term, '$options': 'i'}},
      {type: {'$regex': term, '$options': 'i'}},
      {topic: {'$regex': term, '$options': 'i'}},
    ]};
  }
  const events = await Event.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('events/index', {events: events, term: term});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('events/new', {event: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  res.render('events/edit', {event: event});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('author');
  const registers = await Register.find({event: event.id}).populate('author');
  event.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await event.save();
  res.render('events/show', {event: event, registers: registers});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const event = await event.findById(req.params.id);

  if (!event) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }
  event.title = req.body.title;
  event.content = req.body.content;
  event.location = req.body.location;
  event.stdate=req.body.stdate;
  event.endate=req.body.endate;
  event.sttime=req.body.sttime;
  event.endtime=req.body.endtime;  
  event.paidticket=req.body.paidticket;
  event.freeticket=req.body.freeticket;
  event.price=req.body.price;
  event.image=req.body.price;
  event.organization=req.body.organization;
  event.orcontent=req.body.orcontent;
  event.type=req.body.type;
  event.topic=req.body.topic;

  await event.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/events');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Event.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/events');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var event = new Event({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    location: req.body.location,
    stdate:req.body.stdate,
    endate:req.body.endate,
    sttime:req.body.sttime,
    endtime:req.body.endtime,
    freeticket:req.body.freeticket,
    paidticket:req.body.paidticket,
    price:req.body.price,
    image:req.body.image,
    organization:req.body.organization,
    orcontent:req.body.orcontent,
    type:req.body.type,
    topic:req.body.topic,
  });
  await event.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/events');
}));

router.post('/:id/registers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const event = await Event.findById(req.params.id);

  if (!event) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }

  var register = new Register({
    author: user._id,
    event: event._id,
    content: req.body.content
  });
  await register.save();
  event.numRegisters++;
  await event.save();

  req.flash('success', 'Successfully registered');
  res.redirect(`/events/${req.params.id}`);
}));



module.exports = router;
