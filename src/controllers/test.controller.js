import Test from "../models/test.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllData = asyncHandler(async (req, res) => {    

    // Fetch all data after inserting
    const test = await Test.find();
    if(!test){
        throw new ApiError(404, 'Test data not found')
    }

    const totalData = await Test.countDocuments()
    const countByGender = await Test.aggregate([
        {
            $group:{
                _id:"$gender",
                count: {$sum:1}
            }
        }
    ])

    const minAndMaxSalary= await Test.aggregate([
        {
            $match:{
                salary:{ $regex: /^[0-9]+(\.[0-9]+)?$/ } 
            }
        },
        {
            $addFields: {
                salaryAsNumber: { $toDouble: "$salary" }
            }
        },
        {
            $group:{
                _id:null,
                maxSalary:{$max: "$salary"},
                minSalary: {$min:"$salary"},
                avgSalary:{$avg:"$salaryAsNumber"},
                totalSalary:{$sum:"$salaryAsNumber"}
            }
        }
    ])

    const recordPerDepartments= await Test.aggregate([
        {
            $group:{
                _id: "$department",
                count:{$sum:1}
            }
        }
    ])

    const countSalaryThresold= await Test.find({
        $and:[
            {salary: {$gt:'50000'}},
            {gender: 'female'},
            {department:'hr'}
        ]
    })

    if(!countSalaryThresold){
        throw new ApiError(404,'Not data found')
    }

    const averageSalaryForGenderWise= await Test.aggregate([
        {
            $match:{
                salary:{ $regex: /^[0-9]+(\.[0-9]+)?$/ } 
            }
        },
        {
            $addFields: {
                salaryAsNumber: { $toDouble: "$salary" }
            }
        },
        {
            $group:{
                _id:"$gender",
                count:{$sum:1},
                averageSalary: {$avg:"$salaryAsNumber"},
                totalSalary:{$sum: "$salaryAsNumber"}
            }
        },
    ])
    const totalSalary = await Test.aggregate([
        {
            $addFields:{
                salaryAsNumber:{$toDouble:"$salary"}
            }
        },
        {
            $group:{
                _id:null,
                totalSalary: {$sum:"$salaryAsNumber"}
            }
        }
    ])

    const getRecordByName = await Test.aggregate([
        {
            $addFields: {
                salaryAsNumber: { $toDouble: "$salary" }
            }
        },
        {
            $match:{
                name:'john doe'
            }
        },
        {
            $group:{
                _id:null,
                totalMemberWithSameName:{$sum:1},
                name:{$first:"$name"},
                totalSalary:{$sum:"$salaryAsNumber"},
            }
        },
    ])

    // const getRecordByName1 = await Test.findByIdAndUpdate("6721e9ef4412173ee2a11565",{gender:'female'},{ new: true})
    const getRecordByName1 = await Test.find({$and:[{name:'john doe'},{gender:'female'}]})

    const getFirstfiveData= await Test.aggregate([
        {
            $project:{
                name:1,
                age:1,
                salary:1
            }
        },
        {
            $limit:5
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                // test,
                // totalData:totalData,
                // countByGender:countByGender,
                // averageSalary:averageSalary,
                // minAndMaxSalary:minAndMaxSalary,
                // recordPerDepartments:recordPerDepartments,
                // countSalaryThresold:countSalaryThresold,
                // countSalaryThresold:countSalaryThresold,
                // averageSalaryForGenderWise:averageSalaryForGenderWise,
                // totalSalary:totalSalary,
                // getRecordByName:getRecordByName1,
                getFirstfiveData:getFirstfiveData
            },
            'Data fetched successfully'
        ));
});

export {
    getAllData
};
