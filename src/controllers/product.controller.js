import { Product } from "../models/product.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addProduct = asyncHandler(async(req, res)=>{
    const {name, category, price} = req.body;

    console.log('name, category, price',name, category, price)

    if(!name || !category || !price){
        throw new ApiError(401, 'All fields are required')
    }

    const product = await Product.create({
        name: name,
        category: category,
        price: price
    })

    if(!product){
        throw new ApiError(501, 'Something went wrong')
    }

    return res
        .status(200)
        .json(new ApiResponse(
            201,
            {product:product},
            'Product created successfully.'
        ))
})

const getProductById = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    if(!id){
        throw new ApiError(401, 'Invalid product id')
    }

    const productDetails = await Product.findById({_id:id})
    if(!productDetails){
        throw new ApiError(401,'Product not found')
    }

    return res
        .status(200)
        .json(
           new ApiResponse(
            201,
            {product: productDetails},
            'Product fetched successfully.'
           )
        )
})

const getAllProduct = asyncHandler(async (req, res) => {
    console.log('id',req.body.id)
    try {
        const allProduct = await Product.find();
        
        if (!allProduct) {
            throw new ApiError(404, 'Product not found');
        }

        console.log('allProduct', allProduct);
        
        return res.status(200).json(
            new ApiResponse(
                200,
                { product: allProduct },
                'Product fetch successfully'
            )
        );
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json(
            new ApiError(500, 'An error occurred while fetching products')
        );
    }
});


export{
    addProduct,
    getProductById,
    getAllProduct
}