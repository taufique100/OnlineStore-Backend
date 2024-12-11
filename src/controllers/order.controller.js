import { Customer } from "../models/Customer.modal.js";
import { Order } from "../models/Order.modal.js";
import { Product } from "../models/product.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createOrder= asyncHandler(async(req, res)=>{
    const {customerId, productId} = req.body;
    if(!customerId || !productId){
        throw new ApiError(401, 'All data is required.')
    }

    // const order = await Order.findById({customerId: customerId})
    // console.log('customerId, productId',customerId, productId)
    // console.log('order',order)

    // ll
    // if(order){
    //     throw new ApiError(409, 'Order already done')
    // }

    const customerExist = await Customer.findById(customerId)
    if(!customerExist){
        throw new ApiError(401, 'User does not exist')
    }
    const isProductExist = await Product.findById(productId)

    if(!isProductExist){
        throw new ApiError(401, 'Product does not exist')
    }

    const createOrder = await Order.create({
        customerId: customerId,
        productId: productId,
    })

    if(!createOrder){
        throw new ApiError(501, 'Internal Server error.')
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                {
                    order: createOrder,
                    customer: customerExist,
                    product: isProductExist
                },
                "Order created successfully.")
        )
})

const getOrderDetails = asyncHandler(async(req, res)=>{
    const {orderId} = req.body;
    if(!orderId){
        throw new ApiError(401, 'Order id required.')
    }
    const order = await Order.findById(orderId)
    if(!order){
        throw new ApiError(404, 'Order is not found')
    }

    const customer = await Customer.findById(order?.customerId)
    if(!customer){
        throw new ApiError(501, 'Customer not found')
    }
    const product = await Product.findById(order?.productId)
    if(!product){
        throw new ApiError(501, 'Product not found')
    }
    
    return res
        .status(200)
        .json(new ApiResponse(
            201,
            {
                order: order,
                customer: customer,
                product: product
            }
        ))
})

export{
    createOrder,
    getOrderDetails
}