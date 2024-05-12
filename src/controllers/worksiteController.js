const Worksite = require('../models/Worksite')
const Employee = require('../models/Employee');
const Career = require('../models/Career')
const mongoose = require('mongoose');
const moment = require('moment');
const calcAge = require('../public/js/calcAge');

require("moment-timezone")
require("moment/locale/ko");
moment.locale('ko')

/**
 * GET /
 * Homepage 
*/

exports.worksite = async (req, res) => {
  console.log('/worksite')
  const messages = await req.flash('info');

  const locals = {
    title: "About - NodeJs Notes",
    description: "Free NodeJS Notes App.",
  }

  let perPage = 12;
  let page = req.query.page || 1;

//페이지에 보여줄 작업자 수
  try {
    const worksites = await Worksite.aggregate([ { $sort: {updatedAt: -1 } } ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Worksite.countDocuments({});
    // console.log(worksites)
    res.render('worksite/worksite', { locals, messages, worksites, pages: Math.ceil(count / perPage), current: page, moment: moment } );
  } catch (error) {
    console.log(error);
  }

}

exports.addWorksite = async (req, res) => {
  console.log('/addworksite')
  const locals = {
    title: "Add New Worksite",
    description: "Free Nodejs User Management System.",
  }
  // console.log(req.user)
  res.render('worksite/addworksite', locals);
}

/**
* POST /
* 새로운 근무지 생성
*/

exports.postWorksite = async (req, res) => {
  console.log('request user : ', req.user)
  console.log('post worksite req-body')
  console.log(req.body);

  const newWorksite = new Worksite({
      user: req.user._id,
      name: req.body.name,
      address: req.body.address,
      local: req.body.local,
      salary: req.body.salary,
      worktype: req.body.worktype,
      // date: req.body.date,
      date: new Date(),
      // hour: req.body.hour,
      end: new Date(),
      nopr: req.body.nopr,
      worksitenote: req.body.worksitenote,
  });

  try {
      req.body.user = req.user.id;
      await Worksite.create(newWorksite);
      await req.flash('info', '새 작업현장이 추가되었습니다.')

      res.redirect('/worksite');
  } catch (error) {
      console.log(error);
  }
  
}  

exports.showWorksite = async (req, res) => {
  console.log('/showworksite')
  const { id } = req.params;
  const worksite = await Worksite.findById(id).populate('hired')
  // console.log(worksite)
  res.render('worksite/worksiteDetail', { worksite, moment, calcAge })
}

exports.matchToWorksite = async (req, res) => {
  console.log('/matchworksite')
  const { id } = req.params;
  const uid = req.user.id
  const worksite = await Worksite.findById(id)
  const employees = await Employee.find({user: uid, _id: { $nin: worksite.hired }})
  // console.log('match to worksite')
  // console.log(worksite)
  // console.log(employees)
  res.render('worksite/matchToWorksite', { worksite, employees, calcAge, moment })
}

exports.worksiteHireEmployee = async (req, res) => {
  console.log('/worksiteHireEmployee')
  const { id, eid } = req.params;
  const worksite = await Worksite.findById(id)
  const employee = await Employee.findById(eid)
  worksite.hired.push(employee)
  const career = new Career({ employee, worksite })
  await worksite.save()
  await career.save()
  res.redirect(`/worksite/${id}/hire`)
  await req.flash('info', '근무자가 추가되었습니다.')
  // console.log(career)
}

exports.editWorksite = async (req, res) => {
  console.log('/editworksite')
  const id = req.params.id;
  const worksite = await Worksite.findById(id)
  console.log(worksite)
  res.render('worksite/editWorksite', { worksite, calcAge, moment })
}

exports.putWorksite = async (req, res) => {
  console.log('/putworksite')
  const id = req.params.id;
  const { name, address, local, salary, worktype, date, hour, nopr, note } = req.body;
  const datef = new Date(date)
  await Worksite.findByIdAndUpdate(id,{
    name: name, 
    address: address, 
    local: local, 
    salary: salary, 
    worktype: worktype, 
    date: datef,
    // date.setDate(date.getDate()+7)
    end: datef.setDate(datef.getDate()+hour), 
    nopr: nopr,
    worksitenote: note,
    updatedAt: Date.now()
  })
  const updated = await Worksite.findById(id)
  console.log(updated)
  res.redirect(`/worksite/${id}`)
}

exports.deleteWorksite = async (req, res) => {
  console.log('/deleteworksite')
  const id = req.params.id
  const worksiteToDel = await Worksite.findById(id)
  console.log(worksiteToDel)
  await Worksite.findByIdAndDelete(id)
  res.redirect('/worksite')
}

exports.deleteMatchedEmployee = async (req, res) => {
  console.log('/deleteMatchedEmployee')
  const { id, eid } = req.params;
  console.log('worksite.hired 업데이트 : ', await Worksite.findByIdAndUpdate(
    id, 
    { $pull: { hired: eid } },
    { new: true } // 업데이트된 문서를 반환받으려면 true로 설정
  ))
  // const employee = await Employee.findById(eid)
  // await req.flash('info', `${employee.name} 근무자를 삭제했습니다.`)
  await Career.findOneAndDelete({employee: eid, worksite: id})
  res.redirect(`/worksite/${id}`)
}