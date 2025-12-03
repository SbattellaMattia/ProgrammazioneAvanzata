const jwt = require("jsonwebtoken");

let out = jwt.sign({name:"Adriano", surname: "Mancini", id: "adriano.mancini@gmail.com"}, "ciao", {expiresIn: 60});
console.log(out);

out = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWRyaWFubyIsInN1cm5hbWUiOiJNYW5jaW5pIiwiaWQiOiJhZHJpYW5vLm1hbmNpbmlAZ21haWwuY29tIiwiaWF0IjoxNzQ3MzA2NzA5LCJleHAiOjE3NDczMDY3Njl9.6yRfdFWZOYJQJa7120XeVmxc9wkraFbaeRBEh1fDDgI";


let decoded = jwt.verify(out, "ciao");