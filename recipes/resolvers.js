const recipesModel = require("../models/recipes");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');


//////////////// QUERY ////////////////
async function GetAllRecipes(parent, {name, recipe_name, skip = 0, page = 1, limit = 5}){
     let result;
     /// kondisikan skip dan count
     let count = await recipesModel.count();
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
    if(recipe_name){
        recipe_name = new RegExp(recipe_name, 'i');
         query.$and.push({
            recipe_name:recipe_name
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
        let countMatch = await recipesModel.aggregate([{
            $match: query
        }])
        count = countMatch.length;
    }
 
    result = await recipesModel.aggregate(queryAgg);
    
    /// Pagination Things
    let pages = `${page} / ${Math.ceil(count/limit)}`
    
    /// Fixing id null
    result = result.map((el) => {
        el.id = mongoose.Types.ObjectId(el._id);
        return el;
    })
    
    /// return sesuai typdef
     result = {
             page: pages,
             count: count,
             data_recipes: result,
         }
        
     return result;
 
};

async function GetOneRecipes(parent, {id}){
    let result;
    /// Kondisi untuk parameter, jika ada akan find berdasarkan parameter
    if(id){
        result = await recipesModel.find({_id: mongoose.Types.ObjectId(id)});
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    /// Jika result kosong
    if(result.length < 1 ){
        throw new GraphQLError('Data Tidak Ditemukan');
    }
    return result[0];
};


//////////////// MUTATION ////////////////
async function CreateRecipes(parent, {recipe_name, input, stock_used}){
    try{
        const recipes = new recipesModel({
            recipe_name: recipe_name,
            ingredients: input,
            stock_used:stock_used
        })
    await recipes.save();   
    return recipes;
    }catch(err){
        throw new GraphQLError(err)
    }
}

async function UpdateIngredients(parent, {id, name, stock}){
    let update;
    if(id){
        update = await ingrModel.findByIdAndUpdate(id,{
            stock: stock
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    if (update===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return update;
}

async function DeleteIngredients(parent, {id}){
    try{
    let deleted;
    if(id){
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
    }catch(err){
        throw new ApolloError(err)
    }
}


//////////////// LOADER ////////////////
async function getIngrLoader (parent, args, context){
    if (parent.ingredient_id){
     let cek = await context.ingrLoader.load(parent.ingredient_id)
     return cek
    }
  }

/// temp var resolers to Server
const recipesResolvers = {
    Query: {
        GetAllRecipes,
        GetOneRecipes,
        
    },
    Mutation: {
        CreateRecipes
    },

    ingredient_id: {
        ids: getIngrLoader
    }
};

module.exports = { recipesResolvers };

