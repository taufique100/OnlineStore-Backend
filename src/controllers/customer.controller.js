import { Customer } from "../models/Customer.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCustomer = asyncHandler(async(req, res)=>{
    const {name, location,email } = req.body

    if(!name){
        throw new ApiError(401, 'Name is required.')
    }
    if(!location){
        throw new ApiError(401, 'Location is required.')
    }
    if(!email){
        throw new ApiError(401, 'Email is required.')
    }

    const existedCustomer = await Customer.findOne({email:email})
    if(existedCustomer){
        throw new ApiError(409, 'User alredy existed.')
    }

    const createCustomer = await Customer.create({
        name: name,
        email: email,
        location: location
    })

    if(!createCustomer){
        throw new ApiError(501, 'Something went wrong')
    }
    return res
        .status(200)
        .json(
           new ApiResponse(
            201,
            {
                user: createCustomer
            },
            "User created succssfully."
           )
        )
})

const getAllCustomer = asyncHandler(async(req, res)=>{
    const getAllCustomer = await Customer.find()

    if(!getAllCustomer){
        throw new ApiError(502, 'User not found') 
    }

    return res
        .status(200)
        .json(new ApiResponse(201, {customers:getAllCustomer}, 'Data fetched successfully.'))
})

const getCustomerById = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    if(!id){
        throw new ApiError(401, 'Invalid Customer id')
    }
    const customer = await Customer.findById({_id:id})

    return res
        .status(200)
        .json(new ApiResponse(201, {customer: customer}, "Customer details fetched succussfully."))

})

export {
    addCustomer,
    getAllCustomer,
    getCustomerById
}