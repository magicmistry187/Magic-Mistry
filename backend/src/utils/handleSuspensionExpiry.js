// Helper functon to check if a user's suspension has expired


const handleSuspensionExpiry = async(user)=> {

  

    if(user.status === "suspended" && user.suspendUntil && new Date()>= user.suspendUntil){

        user.status === "active";
        user.suspendUntil = null;
        
        await user.save();
    }
}


module.exports = handleSuspensionExpiry;