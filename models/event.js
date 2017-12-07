const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  location: {type:String, trim: true},
  stdate:{type:String, trim: true},
  endate:{type:String, trim: true},
  sttime:{type:String},
  endtime:{type:String},
  paidticket:{type:String,trim: true},
  freeticket:{type:String,trim: true},
  price:{type:String,trim: true},  
  organization:{type:String, trim:true},
  orcontent:{type:String, trim:true},
  type:{type:String, trim:true},
  topic:{type:String, trim:true},
  numLikes: {type: Number, default: 0},
  numRegisters: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Event = mongoose.model('Event', schema);
// schema.statics.eventType = [ "1", "2" ];
module.exports = Event;
