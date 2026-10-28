// Helper functon to check if a user's suspension has expired


const handleSuspensionExpiry = async(user)=> {

  

    if(user.status === "suspended" && user.suspendedUntil && new Date()>= user.suspendedUntil){

        user.status = "active";
        user.suspendUntil = null;
        
        await user.save();
    }
}


module.exports = handleSuspensionExpiry;