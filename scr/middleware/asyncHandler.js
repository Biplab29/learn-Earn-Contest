const asyncHandler = (fun) =>(req,res,next)=>{
    Promise.resolve(fun(req,res,next)).catch(next);
}

export default asyncHandler;

console.log("asynchandler is working");