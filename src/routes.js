"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");
const FavoriteDoctor = require("./schema/FavoriteDoctor");
const FavoriteCompanion = require("./schema/FavoriteCompanion");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .post((req, res) => {
        const newDoc = req.body;
        Doctor.create(newDoc).save()
            .then(newDoc => {
                res.status(201).send(newDoc);
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error posting new doc."
                });
            })
    });

// optional:

router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        FavoriteDoctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        if (!req.body.id ){
            res.status(500).send({
                message: "Uh oh, needs an id field!"
            });
            return;
        };
        Doctor.findOne({ _id: req.body.id })
            .then(async doc => {
                const allDocs = await FavoriteDoctor.find({});
                for (const j of allDocs){
                    if (j.doctor == req.body.id){
                        res.status(500).send({
                            message: "Doctor with id " + req.body.id + " already exists in doctors/favorites."
                        });
                        return;
                    }
                }
                const newDoc = await FavoriteDoctor.create(doc).save();
                res.status(201).send(newDoc);
            })
            .catch(err => {
                res.status(500).send({
                    message: "Doctor with id " + req.body.id + " does not exist."
                });
            })
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findOne({ _id: req.params.id })
            .then(doc => {
                res.status(200).send(doc);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Doctor with id " + req.params.id + " does not exist."
                });
            })
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        Doctor.findOneAndUpdate(
            { _id: req.params.id }, 
            req.body,
            { new: true }
        )
            .then(doc => {
                res.status(200).send(doc)
                })
            .catch(err =>{
                res.status(404).send({
                    message: "Doctor with id " + req.params.id + " does not exist."
                });
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findOneAndDelete({ _id: req.params.id })
            .then(doc => {
                res.status(200).send(null);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Doctor with id " + req.params.id + " does not exist."
                });
            })
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Companion.find({ doctors: req.params.id })
            .then(doc => {
                res.status(200).send(doc);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Doctor with id " + req.params.id + " does not exist."
                });
            })
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Companion.find({ doctors: req.params.id })
            .then(doc => {
                let good = true;
                for (const i of doc){
                    if (i.alive == false) {
                        good = false;
                    }
                }
                res.status(200).send(good);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Doctor with id " + req.params.id + " does not exist."
                });
            })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .get((req, res) => {
        console.log(`GET /doctors/favorites/${req.params.doctor_id}`);
        FavoriteDoctor.findOne({ doctor: req.params.doctor_id })
            .then(doc => {
                res.status(200).send(doc);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Doctor with id " + req.params.doctor_id + " does not exist in favorites."
                });
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        FavoriteDoctor.findOneAndDelete({ doctor: req.params.doctor_id })
            .then(doc => {
                res.status(200).send(null);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Doctor with id " + req.params.doctor_id + " does not exist in favorites."
                });
            })
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        const newCom = req.body;
        Companion.create(newCom).save()
            .then(newCom => {
                res.status(201).send(newCom);
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error posting new companion."
                });
            })
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({})
            .then(com => {
                let cross = [];
                for (const i of com){
                    if (i.doctors.length > 1){
                        cross.push(i);
                    }
                }
                res.status(200).send(cross);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Companion with id " + req.params.id + " does not exist."
                });
            })
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        FavoriteCompanion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        if (!req.body.id ){
            res.status(500).send({
                message: "Uh oh, needs an id field!"
            });
            return;
        };
        Companion.findOne({ _id: req.body.id })
            .then(async com => {
                const allComs = await FavoriteCompanion.find({});
                for (const j of allComs){
                    if (j.companion == req.body.id){
                        res.status(500).send({
                            message: "Companion with id " + req.body.id + " already exists in companions/favorites."
                        });
                        return;
                    }
                }
                const newCom = await FavoriteCompanion.create(com).save();
                res.status(201).send(newCom);
            })
            .catch(err => {
                res.status(500).send({
                    message: "Doctor with id " + req.body.id + " does not exist."
                });
            })
    });

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findOne({ _id: req.params.id })
            .then(com => {
                res.status(200).send(com);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Companion with id " + req.params.id + " does not exist."
                });
            })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findOneAndUpdate(
            { _id: req.params.id }, 
            req.body,
            { new: true }
        )
            .then(com => {
                res.status(200).send(com)
                })
            .catch(err =>{
                res.status(404).send({
                    message: "Companion with id " + req.params.id + " does not exist."
                });
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findOneAndDelete({ _id: req.params.id })
            .then(com => {
                res.status(200).send(null);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Companion with id " + req.params.id + " does not exist."
                });
            })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.findOne({ _id: req.params.id })
            .then( async com => {
                let doctors = [];
                for (const i of com.doctors){
                    const doctor = await Doctor.findById(i);
                    doctors.push(doctor);
                }
                res.status(200).send(doctors);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Companion with id " + req.params.id + " does not exist."
                });
            })
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findOne({ _id: req.params.id })
            .then(async com => {
                let friends = [];
                const companions = await Companion.find({});
                for (const i of com.seasons){
                    for (const j of companions){
                        if (j.seasons.includes(i) && !friends.includes(j) && j._id != req.params.id){
                            friends.push(j);
                        }
                    }
                }
                res.status(200).send(friends);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Companion with id " + req.params.id + " does not exist."
                });
            })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .get((req, res) => {
        console.log(`GET /companions/favorites/${req.params.companion_id}`);
        FavoriteCompanion.findOne({ companion: req.params.companion_id })
            .then(com => {
                res.status(200).send(com);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Companion with id " + req.params.companion_id + " does not exist in favorites."
                });
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        FavoriteCompanion.findOneAndDelete({ companion: req.params.companion_id })
            .then(com => {
                res.status(200).send(null);
            })
            .catch(err => {
                res.status(404).send({
                    message: "Companion with id " + req.params.companion_id + " does not exist in favorites."
                });
            })
    });

module.exports = router;