import express from "express";
import createPost from "@/controllers/post/createPost";
import getPost from "@/controllers/post/getPost";
import { likePost } from "@/controllers/post/likePost";
import editPost from "@/controllers/post/editPost";
import { getAllPost } from "@/controllers/post/getAllPost";
import verifyToken from "@/middlewares/verifyToken";
import { optVerifyToken } from "@/middlewares/optVerifyToken";

const router = express.Router();
router.get("/", optVerifyToken, getAllPost);
router.post("/create", verifyToken, createPost);
router.get("/:id", getPost);
router.put("/:id/like", verifyToken, likePost);
router.put("/:id/edit", verifyToken, editPost);

export default router;
