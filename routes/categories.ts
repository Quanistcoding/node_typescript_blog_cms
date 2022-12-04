import { Router } from "express";
import ICategory from "../dtos/category";
import Category from "../models/category";
import Debug from "debug";
require("express-async-errors");

const debug = Debug("routes:categories");
const router = Router();

router.get("/",async (req,res,next)=>{
        const result = await Category.find();
        res.json(result);
})

router.get("/:id",async (req,res)=>{
    const id = Number(req.params.id);
    if(isNaN(id))return res.status(400).send("id is not a number");

    const result = await Category.findOne(id);
    res.json(result);
})

router.post("/", async (req,res)=>{
    const {error} = Category.validate(req.body as ICategory);
    if(error)return res.status(400).send(error.details[0].message);

    const result = await Category.insertOne(req.body);
     res.json(result);
})

router.put("/:id",async (req,res)=>{
    const {error} = Category.validate(req.body as ICategory);
    if(error)return res.status(400).send(error.details[0].message);

    const id = Number(req.params.id);
    if(isNaN(id))return res.status(400).send("id is not a number");

    const result = await Category.updateById(id,req.body);
    res.json(result);
})

router.delete("/:id",async (req,res)=>{
    const id = Number(req.params.id);
    if(isNaN(id))return res.status(400).send("id is not a number");

    const result = await Category.deleteById(id);
    res.json(result);
})

export default router;