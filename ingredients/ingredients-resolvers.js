const ingrModel = require("../models/ingredients");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const recipeModel = require("../models/recipes");


//////////////// QUERY ////////////////
async function GetAllIngredients(parent, {name, status, stock, skip = 0, page = 1, limit = 5}){
     let result;
     /// kondisikan skip dan count
     let count = await ingrModel.count();
     skip = (page-1)*limit;
  
     
     /// temp var for query
     let query = { $and: []};
     let queryAgg = [
        {
            $skip: skip
        },{
            $limit: limit
        }
     ];
 
     /// Kondisi untuk parameter, jika ada akan di push ke query $and
    if(name){
        name = new RegExp(name, 'i');
         query.$and.push({
            name:name
         });
        }
     
    /// filter by stock
    if(stock > 0){
        query.$and.push({
            stock: stock
        });
    }
         
    if(status){
        query.$and.push({
            status:status
        });
    }
     /// Kondisi jika semua parameter terisi, akan melakukan pipeline match
     if (query.$and.length > 0){
         queryAgg.unshift(
             {
                 $match: query
             }
         )
        /// Update count jika termatch tanpma melibatkan skip
        let countMatch = await ingrModel.aggregate([{
            $match: query
        }])
        count = countMatch.length;
    }
 
    result = await ingrModel.aggregate(queryAgg);
    
    
  
     
    //  console.log(result.length)
 
     /// Pagination Things
     let pages = page;
     let maxPages = Math.ceil(count/limit);
 
     /// Fixing id null
     result = result.map((el) => {
         el.id = mongoose.Types.ObjectId(el._id);
         return el;
     })
 
     /// return sesuai typdef
     result = {
         page: pages,
         maxPage: maxPages,
         count: count,
         data: result,
     }
     return result;
 
};

async function GetOneIngredients(parent, {id}){
    let result;
    /// Kondisi untuk parameter, jika ada akan find berdasarkan parameter
    if(id){
        result = await ingrModel.find({_id: mongoose.Types.ObjectId(id)});
    }else if(email){
        result = await ingrModel.find({email:email});
    }else{
        throw new GraphQLError('id ingredient tidak terbaca');
    }

    /// Jika result kosong
    if(result.length < 1 ){
        throw new GraphQLError('Data Tidak Ditemukan');
    }
    return result[0];
};


//////////////// MUTATION ////////////////
async function CreateIngredients(parent, {name, stock}){
    try{

        /// Cek ingredient sudah ada belum
        const check = await ingrModel.findOne({ name: new RegExp("^" + name.trim() + "$", 'i') });
        //// kalo ada return error
        if (check) { throw new GraphQLError(`Ingredient: ${name} sudah ada`) }
        let addIngr = {};
        addIngr = new ingrModel({
        name: name,
        stock: stock
    })
    await addIngr.save();
    return addIngr;
    }catch(err){
        throw new GraphQLError(err)
    }
}

async function UpdateIngredients(parent, {id, stock}){
    let update;
    if(id){
        update = await ingrModel.findByIdAndUpdate(id,{
            stock: stock
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('id ingredient tidak terbaca');
    }

    if (update===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return update;
}

async function DeleteIngredients(parent, {id}){
    let deleted;
    if(id){
        let usedRecipes = [];
        const check = await findIngredientInRecipe(id);
        /// untuk error message
        for(const recipes of check.recipes){
            usedRecipes.push(recipes.recipe_name)
        }
        check.recipes 
        if (check.status === false) throw new GraphQLError(`${id} tidak bisa dirubah, terpakai di resep ${usedRecipes}`)
        deleted = await ingrModel.findByIdAndUpdate(id,{
            status: 'deleted'
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    if (deleted===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return deleted;
}


//// unutk check ingredient dipakai atau ngak
async function findIngredientInRecipe(id) {
    const recipes = await recipeModel.find({ ingredients: { $elemMatch: { ingredient_id: mongoose.Types.ObjectId(id) } } })
    if (!recipes.length) return {status: true};
    return {recipes, status: false}
}


/// temp var resolers to Server
const ingrResolvers = {
    Query: {
        GetAllIngredients,
        GetOneIngredients
    },
    Mutation: {
        CreateIngredients,
        UpdateIngredients,
        DeleteIngredients
    }
};

module.exports = { ingrResolvers };