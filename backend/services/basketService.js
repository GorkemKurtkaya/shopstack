
import redisClient from "../utils/redis.js";


const getCartKey = (userId) => `cart:${String(userId)}`;





// Sepete ürün ekleme
async function addToCart(params) {
    const { userId, product } = params;
    const cartKey = getCartKey(userId);
    try {
        const client = redisClient;
        
        
        const existingCartString = await client.get(cartKey);
        let existingCart = [];

        if (existingCartString) {
            try {
                existingCart = JSON.parse(existingCartString);
                if (!Array.isArray(existingCart)) {
                    existingCart = [];
                }
            } catch (parseError) {
                existingCart = [];
            }
        }

        const existingProductIndex = existingCart.findIndex(
            item => item.productId === product.productId
        );

        if (existingProductIndex > -1) {
            existingCart[existingProductIndex].quantity += product.quantity;
        } else {
            existingCart.push(product);
        }

        await client.set(cartKey, JSON.stringify(existingCart));
        return true;
    } catch (e) {
        console.log('Add to cart error:', e);
        return false;
    }
}

// Sepeti getirme
async function getBasket(params){
    const client = redisClient;
    
    const cartKey = getCartKey(params.userId);

    try{

        const value = await client.get(cartKey)
        if (!value) return [];
        return JSON.parse(value)
    }catch(e){
        console.log(e);
    }
}

// Sepeti silme
async function removeCart(params) {
    const { userId } = params; 
    const cartKey = getCartKey(userId);  
    try {
        const client = redisClient;
        const result = await client.del(cartKey);
        return result === 0 
            ? { success: false, message: "Ürün bulunamadı" }
            : { success: true, message: "Ürün başarıyla silindi" };
    } catch (e) {
        console.error(e);
        throw new Error("Internal Server Error");
    }
}

// Sepetteki ürünü güncelleme
const updateCartItem = async (params,res) => {
    const { userId, productId, action } = params;

    const cartKey = getCartKey(userId);

    try {
        const client = redisClient;

        let cart = await client.get(cartKey);

        if (!cart) {
            return { status: 404, message: "Sepet bulunamadı" };
        }

        cart = JSON.parse(cart);

        console.log("Sepet içeriği:", cart);

        const productIndex = cart.findIndex(item => item.productId === productId);

        if (productIndex === -1) {
            return { status: 404, message: "Ürün bulunamadı" };
        }

        let productQuantity = cart[productIndex].quantity;

        if (action === "increment") {
            productQuantity += 1;
            cart[productIndex].quantity = productQuantity;
        } else if (action === "decrement") {
            if (productQuantity > 1) {
                productQuantity -= 1;
                cart[productIndex].quantity = productQuantity;
            } else {
                cart.splice(productIndex, 1);
                if (cart.length === 0) {
                    await client.del(cartKey);
                    return { status: 200, message: "Sepet başarıyla boşaltıldı" };
                }
            }
        } else if (action === "remove") {
            cart.splice(productIndex, 1);
            if (cart.length === 0) {
                await client.del(cartKey);
                return { status: 200, message: "Sepet başarıyla boşaltıldı" };
            }
        } else {
            return { status: 400, message: "Geçersiz işlem türü" };
        }
        await client.set(cartKey, JSON.stringify(cart));

        return { status: 200, message: `Ürün başarıyla güncellendi: ${action}` };
    } catch (e) {
        console.log(e);
        return { status: 500, message: "Internal Server Error" };
    }
};





export {addToCart,getBasket,removeCart,updateCartItem}