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

fishRouter.post("/new", (req, res) => {
    const fish: Fish = req.body;
    createFish(fish);

    res.status(200);
    res.send({
        status: 200,
        message: `Peixe adicionado na tabela`
    });
})

fishRouter.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    deleteFish(id);

    res.status(200);
    res.send({
        status: 200,
        message: `O peixe de id=${id} foi deletado da tabela`
    })
})

export default fishRouter;