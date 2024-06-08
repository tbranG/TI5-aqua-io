import { Router } from "express";
import {Fish, IResponseView} from "../models";
import { readTable, createFish, deleteFish } from "../db";

const fishRouter = Router();

fishRouter.get("/", async (req, res) => {
    const id = req.query.id == undefined ? null : parseInt(req.query.id as string);

    const fishData = await readTable(id);
    res.status(200);
    res.send(fishData);
});

fishRouter.post("/new", async (req, res) => {
    const fish: Fish = req.body;
    const response = await createFish(fish);

    res.status(response.status);
    res.send(response);
})

fishRouter.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await deleteFish(id);

    res.status(response.status);
    res.send(response);
})

export default fishRouter;