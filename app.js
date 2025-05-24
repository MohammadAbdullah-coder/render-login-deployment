const express = require('express')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname,'sqlData.db')
const app = express()
const {open} = require('sqlite')
const { request } = require('http')
const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken')
// const { use } = require('react')
app.use(express.json())

let db = null

const initializeDBandServer = async()=>{
    try{
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        app.listen(3000, ()=>(
            console.log('Server is ruuning on Port')
        ))
       
    }catch(e){
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
        
    }
}
initializeDBandServer()

app.post('/login/',async(request,response)=>{
    const {username,password,name,gender,location} = request.body
    const hashedPassword = await bcrypt.hash(password,10)
    const selectUserQuery =  `
    SELECT * FROM user where username='${username}'
    `
    const dbuser = await db.get(selectUserQuery)

    if(dbuser===undefined){
        const addQuery = `
        INSERT INTO user(username,password,name,gender,location)
        values(
        '${username}',
        '${hashedPassword}',
        '${name}',
        '${gender}',
        '${location}'
        );
        `
        await db.run(addQuery)
       response.send(`New User has been created`)
    }else{
        response.status=400
        response.send('User exits')
    }

   
})

app.get('/login',async(request,response)=>{
    const getUser = `
    select * from user
    `
    const dbResponse = await db.get(getUser)
    response.send(dbResponse)
})

app.post('/login/users/',async(request,response)=>{
    const {username,password,name,gender,location} = request.body
    // const hashedPassword = await bcrypt.hash(password,10)
    const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}'
    `
    const dbuser = await db.get(selectUserQuery)
    if(dbuser === undefined){
         response.status(400);
         response.send("Invalid User");
    }else{
        const isPasswordMatch = await bcrypt.compare(password,dbuser.password)
        if (isPasswordMatch === true) {
            // const payload = {username:username}
            // const jwtToken = jwt.sign(payload,'secrect_Key')
            // response.send({jwtToken})
            response.send("Login Success!");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
    }
    
})

app.put('/login/updateuser/',async(request,response)=>{

    const {username,password,name,gender,location} = request.body

    const hashedPassword = await bcrypt.hash(password,10)

    const updateQuery = `UPDATE user 
    SET 
    username = '${username}',
    password = '${hashedPassword}',
    name = '${name}',
    gender = '${gender}',
    location = '${location}'

    WHERE username = '${username}'
    `
    try{
        await db.get(updateQuery)
        
        response.send('User details updated successfully')
    }
    catch(error){
         response.status(500).send("Error updating user details");
    }


})

app.get('/login/user/',async(request,response)=>{
    const getData = `SELECT * from user`
    const getQuery= await db.get(getData)
    response.send(getQuery)
})