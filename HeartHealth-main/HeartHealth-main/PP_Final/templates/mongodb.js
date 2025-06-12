const mongoose = require("mongoose");

async function connectToMongoDB() {
  try {
    await mongoose.connect("mongodb+srv://Sasidhar:Sasidhar097@cluster0.i1yqegl.mongodb.net/?retryWrites=true&w=majority",{

    //  await mongoose.connect("mongodb://localhost:27017/unamepwd", {
    // await mongoose.connect("mongodb+srv://Akash:Akash088@cluster0.i1yqegl.mongodb.net/?retryWrites=true&w=majority",{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw error; 
  }
}

connectToMongoDB();
LogInSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
  },
  password: {
      type: String,
      required: true,
  },
  details: [
    {
      fullname:
      {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      empid: {
        type: Number,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
      bloodgroup: {
        type: String,
        required: true,
      },
      imagePath:
      {
        type: String,
      },
    },
  ],
  formHistory: [
      {
          date: {
              type: Date,
              default: Date.now,
          },
          formValues: {
              HighBP: String,
              HighChol: String,
              CholCheck: String,
              BMI: String,
              Smoker:String,
              Stroke:String,
              Diabetes: String,
              PhysActivity: String,
              Fruits: String,
              Veggies: String,
              HvyAlcoholConsump:String,
              GenHlth: String,
              MentHlth: String,
              PhysHlth: String,
              DiffWalk: String,
              Sex: String,
              Age: String,
              Weight:String,
              Height:String,
              pythonOutput:String,
          },
      },
  ],
});

const collection3 = mongoose.model("collection9", LogInSchema);

module.exports = collection3;
