let testid;
let user_id;
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const session = require('express-session');
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const collection2 = require("./mongodb");
const formDataArray = [];
const { exec }=require('child_process');
const collection3 = require("./mongodb");
// const venvPath = '/Users/sasi_/ml/venv'; 
// const pythonScriptPath = '/Users/sasi_/ml/basics/predict_model.py';
const pythonScriptPath = 'predict_model.py';
const hbs = require('hbs');
let userId;
let pythonOp;
let date;
let riskPercentage;
const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, '../templates');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let loginError = false;
let signupError = false;  


app.get("/", (req, res) => {
    res.render("homepage");
});



app.get("/signup", (req, res) => {
    res.render("login", { loginError, signupError });
});

app.post("/signup", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.signuppassword, 10);
    const data = {
        _id: new mongoose.Types.ObjectId(),
        name: req.body.signupname,
        password: hashedPassword,
    };
    const checking = await collection2.findOne({ name: req.body.signupname });

    if (req.body.signuppassword === req.body.passwordcheck) {
        if (checking) {
            signupError = true;
            const signupErrorMessage = "User details already exist, so please sign in.";
            return res.render('login', { signupErrorMessage, hideSignupButton: true, loginError, signupError });
        } else {
            try {
                await collection3.insertMany([data]);
                const success = "Account has been created, So Please Sign-In."
                const newUser = await collection3.findOne({ name: req.body.signupname });
                user_id = newUser._id;
                console.log(user_id);
                res.render("login", { success });
            } catch (error) {
                signupError = true;
                const signupErrorMessage = "Error during user signup.";
                return res.render('login', { signupErrorMessage, loginError, signupError });
            }
        }

    } else {
        signupError = true;
        const signupErrorMessage = "Re-check the passwords";
        return res.render('login', { signupErrorMessage, loginError, signupError });
    }

});

app.post("/login", async (req, res) => {
    try {
        const check = await collection3.findOne({ name: req.body.loginname });
        if (check && (await bcrypt.compare(req.body.loginpassword, check.password))) {
            loginError = false;
            signupError = false;
            req.session.userId = check._id;
            console.log(check._id);
            user_id=check._id;
            return res.redirect(`/profile`);
        } else {
            loginError = true;
            const loginErrorMessage = "Sorry, your password was incorrect. Please double-check your password.";
            res.render('login', { loginErrorMessage, loginError, signupError });
        }
    } catch {
        loginError = true;
        const loginErrorMessage = "Create a new account before Sign - In";
        res.render('login', { loginErrorMessage, loginError, signupError });
    }
});



app.get("/details", (req, res) => {
    res.render('details');
});

app.post('/submit', async (req, res) => {
    try {
        console.log(user_id);


        if (user_id) {
            const existingUser = await collection3.findById(user_id).exec();

            if (existingUser.details && existingUser.details.length === 0) {
                const details = [
                    {
                        fullname: req.body.details[0].fullname.toUpperCase(),
                        age: req.body.details[0].age,
                        height: req.body.details[1].height,
                        empid: req.body.details[2].empid,
                        gender: req.body.gender,
                        bloodgroup: req.body.bloodgroup,
                        imagePath: getProfileImage(req.body.gender),
                    },
                ];

                await collection3.findByIdAndUpdate(user_id, { $set: { details: details } });


                //res.redirect(`/profile`);
                return res.redirect(`/profile`);
            } else {
                console.log('Details already exist for the user');
                res.status(400).send('Details already exist for the user');
            }
        } else {
            console.log('User not logged in');
            res.status(401).send('Unauthorized');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

function getProfileImage(gender) {
    if (gender === 'Male') {
        return 'male.png';
    } if (gender === 'Female') {
        return 'female.png';
    } 
    
};
app.get('/profile', async (req, res) => {
    try {
        console.log(user_id);
        userId = user_id;

        if (userId) {
            const user = await collection3.findById(userId).exec();
            if (user.details && user.details.length === 0) {
                res.render('details', { user });
            } else {
                const formHistoryDates = user.formHistory.map(entry => entry.date);
                testid=user.details[0]._id;
                res.render('profile', { user,formHistoryDates });
            } 
        } else {
            console.log('Invalid user ID');
            res.status(400).send('Invalid user ID');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error ');
    }
});


// app.post('/profile', async (req, res) => {
//     try {
//         console.log(user_id);
//         userId = user_id;

//         if (userId) {
//             const user = await collection3.findById(userId).exec();
//             if (user.details && user.details.length === 0) {
//                 res.render('details', { user });
//             } else {
//                 /*
//                 //console.log(typeof(user.formHistory));
//                 const formHistoryDates = user.formHistory;
//                 //console.log(typeof(formHistoryDates));
//                 res.render('profile', { user, formHistoryDates});
//                 */
//                 const formHistoryObject = user.formHistory;
        
//                 // Convert the object into an array of objects
//                 var formHistoryArray = Object.values(formHistoryObject);
//                 console.log(typeof(formHistoryArray));
//                 console.log(formHistoryArray);
                
//                 res.render('profile', { user, formHistoryArray });
//             } 
//         } else {
//             console.log('Invalid user ID');
//             res.status(400).send('Invalid user ID');
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error ');
//     }
// });



app.get("/question", (req, res) => {
    res.render('questions')
    
});



app.post('/formsubmitted', async (req, res) => {
    function convertToYesNo(value) {
        if (value == 1) {
            return 'Yes';
        } else if (value == 0) {
            return 'No';
        } else {
            return value; 
        }
    }
    function convertToYesNodia(value) {
        if (value == 1) {
          return 'Borderline';
        } else if (value == 0) {
          return 'No';
        } else {
          return 'Yes';
        }
      }
    function converttobinary(value)
    {
        if(value==="Male")
        {
            return 1;
        }
        else{
            return 0;
        }
    }

    
    function classifyAge(age) {
        const ageRanges = {
            1: { min: 18, max: 24 },
            2: { min: 25, max: 29 },
            3: { min: 30, max: 34 },
            4: { min: 35, max: 39 },
            5: { min: 40, max: 44 },
            6: { min: 45, max: 49 },
            7: { min: 50, max: 54 },
            8: { min: 55, max: 59 },
            9: { min: 60, max: 64 },
            10: { min: 65, max: 69 },
            11: { min: 70, max: 74 },
            12: { min: 75, max: 79 },
            13: { min: 80, max: Number.POSITIVE_INFINITY }
        };
    
        for (const [range, limits] of Object.entries(ageRanges)) {
            if (age >= limits.min && age <= limits.max) {
                return parseInt(range); 
            }
        }
    }
    try {
        const userdat= await collection3.findById(user_id).exec();
        const details=userdat[0];

        if (!user_id) {
            console.log('User not logged in');
            return res.status(401).send('Unauthorized');
        }

        const weight = parseFloat(req.body.Weight); 
        const height = parseFloat(userdat.details[0].height)/100;
        const bmi = weight / (height * height);
        const sex=converttobinary(userdat.details[0].gender);
        const userDetails = {
            HighBP: parseFloat(req.body.HighBP),
            HighChol: parseFloat(req.body.HighChol),
            CholCheck: parseFloat(req.body.CholCheck),
            BMI: parseFloat(bmi),
            Smoker: parseFloat(req.body.Smoker),
            Stroke: parseFloat(req.body.Stroke),
            Diabetes: parseFloat(req.body.Diabetes),
            PhysActivity: parseFloat(req.body.PhysActivity),
            Fruits: parseFloat(req.body.Fruits),
            Veggies: parseFloat(req.body.Veggies),
            HvyAlcoholConsump: parseFloat(req.body.HvyAlcoholConsump),
            GenHlth: parseFloat(req.body.GenHlth),
            MentHlth: parseFloat(req.body.MentHlth),
            PhysHlth: parseFloat(req.body.PhysHlth),
            DiffWalk: parseFloat(req.body.DiffWalk),
            Sex: parseFloat(sex),
            Age: parseFloat(classifyAge(userdat.details[0].age)), 
        };
        console.log(convertToYesNo(req.body.CholCheck));
        const userDetailsforstorage = {
            HighBP: convertToYesNo(req.body.HighBP),
            HighChol: convertToYesNo(req.body.HighChol),
            CholCheck: convertToYesNo(req.body.CholCheck),
            BMI: String(bmi),
            Smoker: convertToYesNo(req.body.Smoker),
            Stroke: convertToYesNo(req.body.Stroke),
            Diabetes: convertToYesNodia(req.body.Diabetes),
            PhysActivity: convertToYesNo(req.body.PhysActivity),
            Fruits: convertToYesNo(req.body.Fruits),
            Veggies: convertToYesNo(req.body.Veggies),
            HvyAlcoholConsump: convertToYesNo(req.body.HvyAlcoholConsump),
            GenHlth: String(req.body.GenHlth),
            MentHlth: String(req.body.MentHlth),
            PhysHlth: String(req.body.PhysHlth),
            DiffWalk: convertToYesNo(req.body.DiffWalk),
            Sex: String(userdat.details[0].gender),
            Age: String(userdat.details[0].age), 
            Weight : String(req.body.Weight),  
            Height : String(userdat.details[0].height),
            pythonOutput: '',
        };
        console.log(userDetailsforstorage);

        const formDataString = Object.values(userDetails).join(' ');
        const executeCommand = `cd "C:\\Users\\91966\\Desktop\\hearthealth\\ML\\ML" && python ${pythonScriptPath} ${formDataString}`;

        const date = new Date();
        const newFormEntry = {
            date: date,
            formValues: userDetailsforstorage,
        };
        exec(executeCommand, async (error, stdout, stderr) => {
            if (error) {
              console.error(`Error: ${error.message}`);
              return res.status(500).send('Internal Server Error');
            }
          
            let pythonOutput = stdout.trim();
            pythonOp = parseFloat(pythonOutput).toFixed(1);
            console.log(pythonOp);
            pythonOutput=pythonOp.toString();

            newFormEntry.formValues.pythonOutput = pythonOutput; 
            try{
            await collection3
              .findByIdAndUpdate(user_id, { $push: { formHistory: newFormEntry } }, { new: true })
                console.log('Form entry and Python output updated successfully');
                console.log(pythonOutput);
                res.render('result', { pythonOutput });
                riskPercentage = Math.round(pythonOutput);
            }
            catch(err)
            {
                console.log(err);
            }
              })   
        }
        catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
        );


app.post('/previous-records', async (req, res) => {
    try {
        const formId = req.body.formId;
        const user = await collection3.findById(req.session.userId).exec();
        const entry = user.formHistory.find(form => form._id.toString() === formId);

        if (!entry) {
            console.log('Form entry not found');
            return res.status(404).send('Form entry not found');
        }
        res.render('prevRecords1', { user, entry });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


     
     
app.get('/sugg/:riskPercentage', (req, res) => {
    console.log(req.params.riskPercentage);
    riskPercentage=req.params.riskPercentage;
    res.redirect('/sugg');
    
});
app.get('/sugg', (req, res) => {
    getRiskSuggestions(riskPercentage);
    function getRiskSuggestions(riskPercentage) {
        if (riskPercentage <=25) {
            res.render('sugg1',{riskPercentage})
        } else if (riskPercentage <= 50) {
            res.render('sugg2',{riskPercentage})
        } else if (riskPercentage <= 75) {
            res.render('sugg3',{riskPercentage})
        } else {
            res.render('sugg4',{riskPercentage})
        }
    }
});


/*
app.get("/sugg1", (req, res) => {
    res.render('sugg1')
});
*/
app.get('/sugg1', (req, res) => {
    const riskPercentage = req.query.pythonOutputValue;
    // Use the pythonOutputValue as needed in your route logic
    res.render('sugg1', { riskPercentage});
});


app.get("/sugg2", (req, res) => {
    res.render('sugg2')
});

app.get("/sugg3", (req, res) => {
    res.render('sugg3')
});

app.get("/sugg4", (req, res) => {
    res.render('sugg4')
});


hbs.registerHelper('formatDate', (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
  });

app.listen(3020, () => {
    console.log("port connected");
});