import mongoose, {Schema} from "mongoose";

const testSchema= new Schema(
    {
        name:{
            type: String,
            required: true,
            lowercase:true,
            trim:true
        },
        salary:{
            type:String,
            required: true,
            lowercase:true
        },
        gender:{
            type:String,
            required:true,
            enum: ['male', 'female', 'other']
        },
        age:{
            type:String,
            required:true
        },
        department:{
            type: String,
            required: true,
            lowercase: true,
            trim: true
        }

    },
    {timestamps:true}
)

const Test = mongoose.model('Test', testSchema)
export default Test;
