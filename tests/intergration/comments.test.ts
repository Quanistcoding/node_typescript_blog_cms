var request = require("supertest");
import createTableCommentsSql from "../../dbScript/createTalbeCommentsSql"
import Comment from "../../models/comment";

describe("/api/comments",()=>{
    let server:any,con:any;
    let comment:any;

    beforeAll(async ()=>{
        const serverObj = await require('../../index');
        server = serverObj.server;
        con = serverObj.con;
    });

    beforeEach(async ()=>{
        await con.query(createTableCommentsSql);
        comment = {
            postId:1,
            email:"aaa@bbb.com",
            content:"new comment",
            author:"new author"
        }
        await Comment.insertOne({
                postId:1,
                author:"author1",
                email:"email1",
                content:"content1"
            });
        await Comment.insertOne({
                postId:2,
                author:"author2",
                email:"email2",
                content:"content2"
        });
    });

    afterEach(async ()=>{
        const dropTableSql = "DROP table comments";
        await con.query(dropTableSql);
    });

    afterAll(async ()=>{
        await server.close();
        await con.end();
    });

    describe("GET /",()=>{
        it("should return status code 200",async ()=>{
            const res = await request(server).get("/api/comments");
            expect(res.status).toBe(200);
        })
    
        it("should return 2 comment",async ()=>{
            const res = await request(server).get("/api/comments");
            expect(res.body.length).toBe(2);
        })
    });

    describe("GET /:id",()=>{
        it("should return 1 comment",async ()=>{
            const res = await request(server).get("/api/comments/1");
            expect(res.body[0]).toMatchObject({
                postId:1,
                author:"author1",
                email:"email1",
                content:"content1"
            });
        })

        it("should return status 400 when id is not a number",async ()=>{
            const res = await request(server).get("/api/comments/a");
            expect(res.status).toBe(400);
        })

        it("should return 0 comment when row of the id is not found",async ()=>{
            const res = await request(server).get("/api/comments/0.5");
            expect(res.body.length).toBe(0);
        })
    });

    describe("POST /",()=>{
        it("should return status 400 when an empty object is paased",async ()=>{
            const res = await request(server).post("/api/comments")
            .send({});
            expect(res.status).toBe(400);
        })

        it("should return status 400 when postId is not paased",async ()=>{
            comment.postId = null;
            const res = await request(server).post("/api/comments")
            .send(comment);
            expect(res.status).toBe(400);
        })

        it("should return status 400 when email is not paased",async ()=>{
            comment.email = null;
            const res = await request(server).post("/api/comments")
            .send(comment);
            expect(res.status).toBe(400);
        })
        
        it("should return status 400 when contnet is not paased",async ()=>{
            comment.contnet = null;
            const res = await request(server).post("/api/comments")
            .send(comment);
            expect(res.status).toBe(400);
        })

        it("should return status 201 when row is created",async ()=>{
            const res = await request(server).post("/api/comments")
            .send(comment);
            expect(res.status).toBe(201);
        })

        it("should return 3 rows after a row is created",async ()=>{
            await request(server).post("/api/comments")
            .send(comment);
            const res = await request(server).get("/api/comments")
            expect(res.body.length).toBe(3);
        })
    });

    describe("PUT /:id",()=>{
        it("should return status code 400 when id is NaN",async ()=>{
            const res = await request(server).put("/api/comments/a");
            expect(res.status).toBe(400);
        })

        it("should return affectedRows of 0 when row of given id is not found",async ()=>{
            const res = await request(server).put("/api/comments/0.5")
            .send(comment);
            expect(res.body.affectedRows).toBe(0);
        })

        it("should return an updated user when done",async ()=>{
            let updatedString = "updated user";
            comment.author = updatedString;
            await request(server).put("/api/comments/1")
            .send(comment);

            const res = await request(server).get("/api/comments/1");

            expect(res.body[0]).toHaveProperty("author",updatedString)
        })
    })

    describe("DELETE /:id",()=>{
        it("should return status code 400 when id is NaN",async ()=>{
            const res = await request(server).delete("/api/comments/a");
            expect(res.status).toBe(400);
        })

        it("should return affectedRows of 0 when row of given id is not found",async ()=>{
            const res = await request(server).delete("/api/comments/0.5");
            expect(res.body.affectedRows).toBe(0);
        })

        it("should return empty result when deleted",async ()=>{
            await request(server).delete("/api/comments/1");
            const res = await request(server).get("/api/comments/1");
            expect(res.body.length).toBe(0);
        })
    })
})