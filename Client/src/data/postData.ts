"use client";

import { SingleMediaProps } from "@/components/media/SingleMedia";
import { img } from "@/assets/exported";

//import { Post } from "@/types";
const postPic1 = "/assets/images/postpic1.jpg";
const postPic2 = "/assets/images/postpic2.jpg";
const postPic3 = "/assets/images/postpic3.jpg";

export const postData = [
  {
    id: "post1",
    authorId: "1",
    content: "Post 1 content",
    postImage: postPic1,
    likes: [],
    createdOn: Date.now(),
  },
  {
    id: "post2",
    authorId: "1",
    content: "Post 2 content",
    postImage: postPic2,
    likes: [],
    createdOn: Date.now(),
  },
  {
    id: "post3",
    authorId: "2",
    content: "Post 3 content",
    postImage: postPic3,
    likes: [],
    createdOn: Date.now(),
  },
];

export const singleMediaData: SingleMediaProps[] = [
  { media: { src: img.pic6 } },
  { media: { src: img.video, type: "video" } },
];

export const multiMediaData: SingleMediaProps[] = [
  { media: { src: img.pic1 } },
  { media: { src: img.pic2 } },
  { media: { src: img.pic3 } },
  { media: { src: img.pic4 } },
  { media: { src: img.pic4 } },
  { media: { src: img.pic3 } },
  { media: { src: img.video, type: "video" } },
];
