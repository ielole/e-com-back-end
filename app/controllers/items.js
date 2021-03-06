'use strict';

const controller = require('lib/wiring/controller');
const models = require('app/models');
const Item = models.item;

const authenticate = require('./concerns/authenticate');

const index = (req, res, next) => {
  let search = {_owner: req.currentUser._id };
  Item.find(search)
    .then((items) => {
      let serialized = [];
      for(let item in items){
        let tmp = {
          name: items[item].name,
          price: items[item].price,
          description: items[item].description,
          image: items[item].image,
          count: items[item].count,
          product_id: items[item].product_id,
          id: items[item]._id
        };
        serialized.push(tmp);
      }
      res.json({ serialized });
    })
    .catch(err => next(err));
};

const show = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Item.findById(search)
    .then((item) =>{
      if(item){
        let serialized = {
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
            count: item.count,
            product_id: item.product_id,
            id: item._id
        };
        console.log(serialized);
        res.json({ serialized });
      }else{
        next();
      }
    })
    .catch(err => next(err));
};

const create = (req, res, next) => {
  let item = Object.assign(req.body.item, {
    _owner: req.currentUser._id,
  });
  Item.create(item)
    .then(item => res.json({ item }))
    .catch(err => next(err));
};

const update = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Item.findOne(search)
    .then(item => {
      if (!item) {
        return next();
      }

      delete req.body._owner;  // disallow owner reassignment.
      return item.update(req.body.item)
        .then(() => res.sendStatus(200));
    })
    .catch(err => next(err));
};

const destroy = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Item.findOne(search)
    .then(item => {
      if (!item) {
        return next();
      }

      return item.remove()
        .then(() => res.sendStatus(200));
    })
    .catch(err => next(err));
};

module.exports = controller({
  index,
  show,
  create,
  update,
  destroy,
}, { before: [
  { method: authenticate},
], });
