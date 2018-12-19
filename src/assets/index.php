<?php
// if (isset($_SERVER['HTTP_ORIGIN'])) {
//     header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
//     header('Access-Control-Allow-Credentials: true');
//     header('Access-Control-Max-Age: 86400');    // cache for 1 day
// }
// // Access-Control headers are received during OPTIONS requests
// if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
//     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
//         header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
//     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
//         header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
//     exit(0);
// }
require 'config.php';
require 'Slim/Slim.php';
require_once('mailer/PHPMailerAutoload.php');

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();

$app->post('/login','login');
$app->post('/signup','signup');
$app->post('/setup','setup');
$app->post('/confirmEmailAndSentOtp','confirmEmailAndSentOtp');
$app->post('/sendOTP','sendOTP');
$app->post('/semiSignup','semiSignup');
$app->post('/getDataFromDB','getDataFromDB');
$app->post('/addToJobs','addToJobs');
$app->post('/removeFromJobs','removeFromJobs');
$app->post('/addToAppliedJobs','addToAppliedJobs');
$app->post('/addToViewedJobs','addToViewedJobs');
$app->post('/addToSharedJobs','addToSharedJobs');
$app->post('/removeJobFromAppliedJobs','removeJobFromAppliedJobs');
$app->post('/addToAppointments','addToAppointments');
$app->post('/addToViewedCandidates','addToViewedCandidates');
$app->post('/updateAppointmentStatus','updateAppointmentStatus');
$app->post('/updateProfile','updateProfile');
$app->post('/updateSettings','updateSettings');
$app->post('/checkPassword','checkPassword');
$app->post('/updatePassword','updatePassword');
$app->post('/deactivateAccount','deactivateAccount');
$app->post('/uploadProfilePicture','uploadProfilePicture');
$app->post('/updatePictureUrl','updatePictureUrl');
$app->post('/updateRatings','updateRatings');

$app->run();

/*========= UPLOAD PROFILE PIC =============*/
function uploadProfilePicture(){

    $temp = explode(".", $_FILES["file"]["name"]);
    $newfilename = $newfilename = sha1(uniqid(mt_rand(), true)) . '.' .end($temp);
    if(move_uploaded_file($_FILES["file"]["tmp_name"],  "uploads/users/".$newfilename)){
        echo $newfilename;
    }else{
        echo '{"error":"Proifile picture upload failed"}';
    }

}

//========= UPDATE USER PROFILE PIC URL ======
function updatePictureUrl(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $email = $data->email;
    $picture = $data->picture;

    try {

        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email);

        if ( strlen(trim($email))>0 && $email_check>0)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount==1)
            {
                $sql1="UPDATE Users SET picture=:picture WHERE email=:email";

                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);
                $stmt1->bindParam("picture", $picture,PDO::PARAM_STR);

                $stmt1->execute();
                $userData=_getUserDetailsByEmail($email);
            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"updatePictureUrl, Email '.$email.' already registered"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function sendOTP(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $firstname=$data->firstname;
    $lastname=$data->lastname;
    $email=$data->email;
    $otp=$data->otp;
    $password=$data->password;
    $msg = 'Congratulation, you are one step close to creating your Spani. ';

    _sendEmail($email, $otp, $msg);
}


function confirmEmailAndSentOtp(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $email=$data->email;
    $otp=$data->otp;
    $msg = 'You have requested a password reset. ';
    if(_userExists($email)) {
        _sendEmail($email, $otp, $msg);
    } else {
        echo '{"error": "User not registered"}';
    }
}


function _userExists($email) {
    if($email)
    {
        $sql = "SELECT * FROM Users WHERE email='$email'";
        $db = getDB();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $mainCount=$stmt->rowCount();
        if($mainCount==1)
        {
            return true;
        } else {
            return false;
        }
    }
    else{
        return false;
    }
}


function _sendEmail($email, $otp, $msg) {
    if ($email && $otp && $msg)
    {
        $mail = new PHPMailer(true);                              // Passing `true` enables exceptions
        try {
            //Server settings
            // $mail->SMTPDebug = 2;                                 // Enable verbose debug output
            $mail->isSMTP();                                      // Set mailer to use SMTP
            $mail->Host = 'smtp.gmail.com';  // Specify main and backup SMTP servers
            $mail->SMTPAuth = true;                               // Enable SMTP authentication
            $mail->Username = 'harry0developer@gmail.com';                 // SMTP username
            $mail->Password = 'Cychedelic1';                           // SMTP password
            $mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
            $mail->Port = 587;                                    // TCP port to connect to

            //Recipients
            $mail->setFrom('admin@spani.co.za', 'Spani App');
            $mail->addAddress($email);

            //Content
            $mail->isHTML(true);                                  // Set email format to HTML
            $mail->Subject = 'Spani OTP: '.$otp;
            $mail->Body    = $msg.'<br/>Use this OTP code to verify your account: <b>'.$otp.'</b>';
            $response = $mail->send();
            if($response) {
                echo '{"data":' .$otp. '}';
            } else {
                echo '{"error":{"text":"Email not sent"'. $mail->ErrorInfo.'}}';
            }

        } catch (Exception $e) {
            echo '{"error":{"text":"Email not sent"'. $mail->ErrorInfo.'}}';
        }
    } else {
        echo '{"error":"Parameters not aligned"}';
    }
}

function login() {
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $email = $data->email;
    $password = $data->password;
    $status = $data->status;
    $date_updated = $data->date_updated;
    try {
        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email);
        $password_check = preg_match('~^[A-Za-z0-9!@#$%^&*()_]{6,20}$~i', $password);

        if (strlen(trim($password))>0 && strlen(trim($email))>0 && $password_check>0 && $email_check>0)
        {
            $db = getDB();
            $user = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email and password=:password";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $password=hash('sha256',$data->password);
            $stmt->bindParam("password", $password,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount==1)
            {
                $sql1="UPDATE Users SET status=:status, date_updated=:date_updated WHERE email=:email";

                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("status", $status,PDO::PARAM_STR);
                $stmt1->bindParam("date_updated", $date_updated,PDO::PARAM_STR);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);

                $stmt1->execute();
                $userData=_getUserDetailsByEmail($email);
            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"Username and password do not match"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function signup(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $firstname=$data->firstname;
    $lastname=$data->lastname;
    $dob=$data->dob;
    $race=$data->race;
    $nationality=$data->nationality;
    $gender=$data->gender;
    $status=$data->status;
    $last_login=$data->last_login;
    $date_created=$data->date_created;
    $date_updated=$data->date_updated;
    $type=$data->type;
    $address=$data->address;
    $lat=$data->lat;
    $lng=$data->lng;
    $title=$data->title;
    $email=$data->email;
    $password=$data->password;
    $phone=$data->phone;
    $picture=$data->gender . '.svg';

    try {
        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email);
        $password_check = preg_match('~^[A-Za-z0-9!@#$%^&*()_]{4,20}$~i', $password);

        if (strlen(trim($password))>0 && strlen(trim($email))>0 && $password_check>0 && $email_check>0)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount==0)
            {
                $sql1="INSERT INTO Users(firstname, lastname, dob, race, nationality, gender,
                type, address, lat, lng, title, date_created, date_updated, status, last_login, email, password, phone, picture)
                VALUES(:firstname, :lastname, :dob, :race, :nationality, :gender,
                :type, :address, :lat, :lng, :title, :date_created, :date_updated, :status, :last_login, :email, :password, :phone, :picture)";

                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("firstname", $firstname,PDO::PARAM_STR);
                $stmt1->bindParam("lastname", $lastname,PDO::PARAM_STR);
                $stmt1->bindParam("dob", $dob,PDO::PARAM_STR);
                $stmt1->bindParam("race", $race,PDO::PARAM_STR);
                $stmt1->bindParam("nationality", $nationality,PDO::PARAM_STR);
                $stmt1->bindParam("gender", $gender,PDO::PARAM_STR);
                $stmt1->bindParam("type", $type,PDO::PARAM_STR);
                $stmt1->bindParam("address", $address,PDO::PARAM_STR);
                $stmt1->bindParam("lat", $lat,PDO::PARAM_STR);
                $stmt1->bindParam("lng", $lng,PDO::PARAM_STR);
                $stmt1->bindParam("title", $title,PDO::PARAM_STR);
                $stmt1->bindParam("date_created", $date_created,PDO::PARAM_STR);
                $stmt1->bindParam("date_updated", $date_updated,PDO::PARAM_STR);
                $stmt1->bindParam("status", $status,PDO::PARAM_STR);
                $stmt1->bindParam("last_login", $last_login,PDO::PARAM_STR);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);
                $password=hash('sha256',$password);
                $stmt1->bindParam("password", $password,PDO::PARAM_STR);
                $stmt1->bindParam("phone", $phone,PDO::PARAM_STR);
                $stmt1->bindParam("picture", $picture,PDO::PARAM_STR);
                $stmt1->execute();
                $userData=_getUserDetailsByEmail($email);

                $db = null;
                if($userData){
                    $userData = json_encode($userData);
                    echo '{"data": ' .$userData . '}';
                }else {
                   echo '{"error":{"text":"signup, Email '.$email.' already registered"}}';
                }
            } else {
                echo '{"error":{"text":"signup, Email '.$email.' already registered"}}';
            }

        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function semiSignup(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $firstname=$data->firstname;
    $lastname=$data->lastname;
    $email=$data->email;
    $password=$data->password;
    $date_created=$data->date_created;

    try {
        if ($email && $password && $firstname && $lastname)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            $created=time();
            if($mainCount==0)
            {
                $sql1="INSERT INTO Users(firstname, lastname, email, password, date_created)
                    VALUES (:firstname, :lastname, :email, :password, :date_created)";

                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("firstname", $firstname,PDO::PARAM_STR);
                $stmt1->bindParam("lastname", $lastname,PDO::PARAM_STR);
                $stmt1->bindParam("date_created", $date_created,PDO::PARAM_STR);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);
                $password=hash('sha256',$password);
                $stmt1->bindParam("password", $password,PDO::PARAM_STR);
                $stmt1->execute();
                $userData=_getUserDetailsByEmail($email);
            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":" '. $email. ' semiSignup, User data not found by email"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function setup(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $firstname=$data->firstname;
    $lastname=$data->lastname;
    $email=$data->email;

    try {
        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email);

        if (strlen(trim($email))>0 && $email_check>0)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            $created=time();
            if($mainCount!=0)
            {
               echo '{"error":{"text":"setup, Email '.$email.' already registered"}}';
            }
            else {
               echo '{"data":"Email '.$email.'"}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateSettings(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $user_id_fk=$data->user_id_fk;
    $email=$data->email;
    $hide_email=$data->hide_email;
    $hide_phone=$data->hide_phone;
    $hide_nationality=$data->hide_nationality;
    $hide_dob=$data->hide_dob;
    $date_updated=$data->date_updated;

    try {

        if (strlen(trim($email))>0 && $user_id_fk)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id_fk FROM Settings WHERE user_id_fk=:user_id_fk";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
            $stmt->execute();
            $count=$stmt->rowCount();
            if($count==0)
            {
                $sql1="INSERT INTO Settings(user_id_fk, hide_email, hide_phone, hide_dob, hide_nationality, date_updated)
                    VALUES (:user_id_fk, :hide_email, :hide_phone, :hide_dob, :hide_nationality, :date_updated)";
                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
                $stmt1->bindParam("hide_email", $hide_email,PDO::PARAM_STR);
                $stmt1->bindParam("hide_phone", $hide_phone,PDO::PARAM_STR);
                $stmt1->bindParam("hide_dob", $hide_dob,PDO::PARAM_STR);
                $stmt1->bindParam("hide_nationality", $hide_nationality,PDO::PARAM_STR);
                $stmt1->bindParam("date_updated", $date_updated,PDO::PARAM_STR);
                $stmt1->execute();
                $userData=_getDataFromTable('Settings');
            } else {
                $sql1="UPDATE Settings SET hide_email=:hide_email, hide_phone=:hide_phone, hide_nationality=:hide_nationality, hide_dob=:hide_dob, date_updated=:date_updated WHERE user_id_fk=:user_id_fk";
                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
                $stmt1->bindParam("hide_email", $hide_email,PDO::PARAM_STR);
                $stmt1->bindParam("hide_phone", $hide_phone,PDO::PARAM_STR);
                $stmt1->bindParam("hide_dob", $hide_dob,PDO::PARAM_STR);
                $stmt1->bindParam("hide_nationality", $hide_nationality,PDO::PARAM_STR);
                $stmt1->bindParam("date_updated", $date_updated,PDO::PARAM_STR);
                $stmt1->execute();
                $userData=_getDataFromTable('Settings');

            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"No data in settings table"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function checkPassword(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $password=$data->password;
    $email=$data->email;
    $new_password=$data->new_password;
    $user_id=$data->user_id;

    try {
        if ($password && $user_id)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE password=:password AND user_id=:user_id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("user_id", $user_id,PDO::PARAM_STR);
            $password=hash('sha256',$password);
            $stmt->bindParam("password", $password,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount==1)
            {
                $userData=_getUserDetailsByEmail($email);
            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"Password do not match"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function updatePassword(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $email=$data->email;
    $new_password=$data->new_password;
    $date_updated=$data->date_updated;

    try {

        if ($email && $new_password)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount==1)
            {
                $sql1="UPDATE Users SET date_updated=:date_updated, password=:new_password WHERE email=:email";

                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);
                $new_password=hash('sha256',$new_password);
                $stmt1->bindParam("new_password", $new_password,PDO::PARAM_STR);
                $stmt1->bindParam("date_updated", $date_updated,PDO::PARAM_STR);
                $stmt1->execute();
                $userData=_getUserDetailsByEmail($email);
            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"Password do not match"}}';
            }
        }
        else{
            echo '{"error":{"text":"xEnter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function deactivateAccount(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $password=$data->password;
    $email=$data->email;
    $status=$data->status;
    $user_id=$data->user_id;
    $date_updated=$data->date_updated;

    try {

        if ($password && $status && $user_id )
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email AND user_id=:user_id AND password=:password";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->bindParam("user_id", $user_id,PDO::PARAM_STR);
            $password=hash('sha256',$password);
            $stmt->bindParam("password", $password,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount==1)
            {
                $sql1="UPDATE Users SET status=:status, date_updated=:date_updated WHERE user_id=:user_id AND email=:email";

                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);
                $stmt1->bindParam("user_id", $user_id,PDO::PARAM_STR);
                $stmt1->bindParam("status", $status,PDO::PARAM_STR);
                $stmt1->bindParam("date_updated", $date_updated,PDO::PARAM_STR);
                $stmt1->execute();
                $userData=_getUserDetailsByEmail($email);
            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"Password do not match"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateProfile(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $user_id=$data->user_id;
    $email=$data->email;
    $address=$data->address;
    $lat=$data->lat;
    $lng=$data->lng;
    $phone=$data->phone;
    try {
        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email);

        if (strlen(trim($email))>0 && $email_check>0)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $user_count=$stmt->rowCount();
            if($user_count==1)
            {
                $sql1 = "UPDATE Users SET address=:address, lat=:lat, lng=:lng, phone=:phone WHERE user_id=:user_id AND email=:email";

                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);
                $stmt1->bindParam("phone", $phone,PDO::PARAM_STR);
                $stmt1->bindParam("user_id", $user_id,PDO::PARAM_STR);
                $stmt1->bindParam("address", $address,PDO::PARAM_STR);
                $stmt1->bindParam("lat", $lat,PDO::PARAM_STR);
                $stmt1->bindParam("lng", $lng,PDO::PARAM_STR);
                $stmt1->execute();
                $userData=_getUserDetailsByEmail($email);
            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"updateProfile, Email '.$email.' already registered"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function _insertIntoJobs(){

}

function removeFromJobs() {
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $job_id = $data->job_id;
    $recruiter_id_fk = $data->recruiter_id_fk;
    try {
        if (strlen(trim($job_id))>0){
            $db = getDB();
            $sql = "SELECT * FROM Jobs WHERE job_id=:job_id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("job_id", $job_id,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount === 1) {
                $sql1 = "DELETE FROM Jobs WHERE job_id=:job_id AND recruiter_id_fk=:recruiter_id_fk";
                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("job_id", $job_id,PDO::PARAM_STR);
                $stmt1->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
                $stmt1->execute();
                $data=_getDataFromTable('Jobs');
                $db = null;
                if($data){
                    $data = json_encode($data);
                    echo '{"data": ' .$data . '}';
                }else {
                   echo '{"error":{"text":"No jobs available in the database."}}';
                }

            }
            else {
                echo '{"error":{"text":"Job id is not found."}}';
            }
        }
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function addToJobs(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $address= $data->address;
    $category= $data->category;
    $date_posted= $data->date_posted;
    $description= $data->description;
    $experience= $data->experience;
    $job_id= $data->job_id;
    $lat= $data->lat;
    $lng= $data->lng;
    $name= $data->name;
    $recruiter_id_fk= $data->recruiter_id_fk;
    $salary= $data->salary;
    $salary_frequency= $data->salary_frequency;
    $skills= $data->skills;
    $type= $data->type;

    try {
        if (strlen(trim($job_id))>0)
        {
            $db = getDB();
            $sql = "SELECT * FROM Jobs WHERE job_id=:job_id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("job_id", $job_id,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();

            if($mainCount == 1) { //edit
                $jobSQL="UPDATE Jobs SET recruiter_id_fk=:recruiter_id_fk, name=:name, skills=:skills, description=:description, salary=:salary, salary_frequency=:salary_frequency, experience=:experience, lat=:lat, lng=:lng, address=:address, date_posted=:date_posted, type=:type, category=:category WHERE job_id=:job_id";
            } else { //add
                $jobSQL="INSERT INTO Jobs(recruiter_id_fk, name, skills, description, salary, salary_frequency, experience, lat, lng, address, date_posted, type, category)
                    VALUES(:recruiter_id_fk, :name, :skills, :description, :salary, :salary_frequency, :experience, :lat, :lng, :address, :date_posted, :type, :category)";
            }

            $stmt1 = $db->prepare($jobSQL);

            $stmt1->bindParam('address', $address,PDO::PARAM_STR);
            $stmt1->bindParam('category', $category,PDO::PARAM_STR);
            $stmt1->bindParam('date_posted', $date_posted,PDO::PARAM_STR);
            $stmt1->bindParam('description', $description,PDO::PARAM_STR);
            $stmt1->bindParam('experience', $experience,PDO::PARAM_STR);
            $stmt1->bindParam('job_id', $job_id,PDO::PARAM_STR);
            $stmt1->bindParam('lat', $lat,PDO::PARAM_STR);
            $stmt1->bindParam('lng', $lng,PDO::PARAM_STR);
            $stmt1->bindParam('name', $name,PDO::PARAM_STR);
            $stmt1->bindParam('recruiter_id_fk', $recruiter_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam('salary', $salary,PDO::PARAM_STR);
            $stmt1->bindParam('salary_frequency', $salary_frequency,PDO::PARAM_STR);
            $stmt1->bindParam('skills', $skills,PDO::PARAM_STR);
            $stmt1->bindParam('type', $type,PDO::PARAM_STR);

            $stmt1->execute();

            $data=_getDataFromTable('Jobs');
            $db = null;
            if($data){
                $data = json_encode($data);
                echo '{"data": ' .$data . '}';
            }else {
               echo '{"error":{"text":"No jobs posted yet."}}';
            }

        }else{
            echo '{"error":"Job id is not defined"}';
        }
    }catch(PDOException $e) {
        echo '{"error":'. $e->getMessage() .'}';
    }
}


function addToAppliedJobs(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $db = getDB();
    $jobData = '';
    $job_id_fk = $data->job_id_fk;
    $candidate_id_fk = $data->candidate_id_fk;
    $recruiter_id_fk = $data->recruiter_id_fk;
    $date_applied = $data->date_applied;

    try {
        $sql1 = "INSERT INTO AppliedJobs(candidate_id_fk, job_id_fk, recruiter_id_fk, date_applied)
        VALUES(:candidate_id_fk, :job_id_fk, :recruiter_id_fk, :date_applied)";
        $stmt1 = $db->prepare($sql1);
        $stmt1->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("date_applied", $date_applied,PDO::PARAM_STR);

        $stmt1->execute();
        $jobData=_getDataFromTable('AppliedJobs');

        $db = null;
        if($jobData){
            $jobData = json_encode($jobData);
            echo '{"data": ' .$jobData . '}';
        }else {
           echo '{"error":{"text":"You have not applied for a job yet."}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function addToSharedJobs(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $db = getDB();
    $jobData = '';
    $job_id_fk = $data->job_id_fk;
    $candidate_id_fk = $data->candidate_id_fk;
    $recruiter_id_fk = $data->recruiter_id_fk;
    $platform = $data->platform;
    $date_shared = $data->date_shared;

    try {
        $sql1 = "INSERT INTO SharedJobs(candidate_id_fk, job_id_fk, recruiter_id_fk, platform, date_shared)
        VALUES(:candidate_id_fk, :job_id_fk, :recruiter_id_fk, :platform, :date_shared)";
        $stmt1 = $db->prepare($sql1);
        $stmt1->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("platform", $platform,PDO::PARAM_STR);
        $stmt1->bindParam("date_shared", $date_shared,PDO::PARAM_STR);

        $stmt1->execute();
        $jobData=_getDataFromTable('SharedJobs');

        $db = null;
        if($jobData){
            $jobData = json_encode($jobData);
            echo '{"data": ' .$jobData . '}';
        }else {
           echo '{"error":{"text":"No shared jobs"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addToViewedJobs(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $db = getDB();
    $jobData = '';
    $job_id_fk = $data->job_id_fk;
    $candidate_id_fk = $data->candidate_id_fk;
    $recruiter_id_fk = $data->recruiter_id_fk;
    $date_viewed = $data->date_viewed;

    try {

        $db = getDB();
        $jobData = '';
        $sql = "SELECT viewed_job_id FROM ViewedJobs WHERE job_id_fk=:job_id_fk AND candidate_id_fk=:candidate_id_fk AND recruiter_id_fk=:recruiter_id_fk";
        $stmt = $db->prepare($sql);
        $stmt->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
        $stmt->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
        $stmt->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
        $stmt->execute();
        $mainCount=$stmt->rowCount();
        if($mainCount < 1)
        {
            $sql1 = "INSERT INTO ViewedJobs(candidate_id_fk, recruiter_id_fk, job_id_fk, date_viewed)
                VALUES(:candidate_id_fk, :recruiter_id_fk, :job_id_fk, :date_viewed)";
            $stmt1 = $db->prepare($sql1);
            $stmt1->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("date_viewed", $date_viewed,PDO::PARAM_STR);
            $stmt1->execute();
            $jobData=_getDataFromTable('ViewedJobs');

            $db = null;
            if($jobData){
                $jobData = json_encode($jobData);
                echo '{"data": ' .$jobData . '}';
            }else {
               echo '{"error":{"text":"There are no viewed jobs"}}';
            }
        }else{
            echo '{"error":{"text":"The candidate has viewed this job"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function addToViewedCandidates(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $db = getDB();
    $candidateData = '';
    $candidate_id_fk = $data->candidate_id_fk;
    $recruiter_id_fk = $data->recruiter_id_fk;
    $date_viewed = $data->date_viewed;

    try {

        $db = getDB();
        $candidateData = '';
        $sql = "SELECT viewed_candidate_id FROM ViewedCandidates WHERE candidate_id_fk=:candidate_id_fk AND recruiter_id_fk=:recruiter_id_fk";
        $stmt = $db->prepare($sql);
        $stmt->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
        $stmt->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
        $stmt->execute();
        $mainCount=$stmt->rowCount();
        if($mainCount < 1)
        {
            $sql1 = "INSERT INTO ViewedCandidates(candidate_id_fk, recruiter_id_fk, date_viewed)
                VALUES(:candidate_id_fk, :recruiter_id_fk, :date_viewed)";
            $stmt1 = $db->prepare($sql1);
            $stmt1->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("date_viewed", $date_viewed,PDO::PARAM_STR);
            $stmt1->execute();
            $candidateData=_getDataFromTable('ViewedCandidates');

            $db = null;
            if($candidateData){
                $candidateData = json_encode($candidateData);
                echo '{"data": ' .$candidateData . '}';
            }else {
               echo '{"error":{"text":"There are no viewed candidates"}}';
            }
        }else{
            echo '{"data":{"text":"The recruiter has viewed this candidate"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function removeJobFromAppliedJobs(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $db = getDB();
    $jobData = '';
    $job_id_fk = $data->job_id_fk;
    $candidate_id_fk = $data->candidate_id_fk;
    $recruiter_id_fk = $data->recruiter_id_fk;

    try {
        $sql1 = "DELETE from AppliedJobs WHERE job_id_fk=:job_id_fk AND recruiter_id_fk=:recruiter_id_fk AND candidate_id_fk=:candidate_id_fk";
        $stmt1 = $db->prepare($sql1);
        $stmt1->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);

        $stmt1->execute();
        $jobData=_getDataFromTable('AppliedJobs');

        $db = null;
        if($jobData){
            $jobData = json_encode($jobData);
            echo '{"data": ' .$jobData . '}';
        }else {
           echo '{"error":{"text":"You have not applied for a job yet."}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addToAppointments(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $candidate_id_fk = $data->candidate_id_fk;
    $recruiter_id_fk = $data->recruiter_id_fk;
    $status = $data->status;
    $date_created = $data->date_created;
    try {
        if (  strlen(trim($recruiter_id_fk))>0 && strlen(trim($candidate_id_fk))>0 )
        {
            $db = getDB();
            $data = '';
            $sql1="INSERT INTO Appointments(candidate_id_fk, recruiter_id_fk, status, date_created)
                VALUES(:candidate_id_fk, :recruiter_id_fk, :status, :date_created)";
            $stmt1 = $db->prepare($sql1);
            $stmt1->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("status", $status,PDO::PARAM_STR);
            $stmt1->bindParam("date_created", $date_created,PDO::PARAM_STR);
            $stmt1->execute();

            $data=_getDataFromTable('Appointments');
            $db = null;
            if($data){
                $data = json_encode($data);
                echo '{"data": ' .$data . '}';
            }else {
               echo '{"error":{"text":"You have no appointments yet."}}';
            }

        }else{
            echo '{"error":"Parameters not aligned"}';
        }
    }catch(PDOException $e) {
        echo '{"error":'. $e->getMessage() .'}';
    }
}


function updateRatings() {
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $db = getDB();
    $ratings = '';
    $user_id_fk = $data->user_id_fk;
    $rating = $data->rating;
    $count_raters = $data->count_raters;
    $date_rated = $data->date_rated;


    try {
        $sql = "SELECT * FROM Ratings WHERE user_id_fk=:user_id_fk";
        $stmt = $db->prepare($sql);
        $stmt->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
        $stmt->execute();
        $mainCount=$stmt->rowCount();
        if($mainCount == 1)
        {
            $sql1 = "UPDATE Ratings SET rating=:rating, count_raters=:count_raters, date_rated=:date_rated WHERE user_id_fk=:user_id_fk";
        } else {
            $sql1 = "INSERT INTO Ratings(user_id_fk, rating, count_raters, date_rated)
            VALUES(:user_id_fk, :rating, :count_raters, :date_rated)";
        }

        $stmt1 = $db->prepare($sql1);

        $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("rating", $rating,PDO::PARAM_STR);
        $stmt1->bindParam("count_raters", $count_raters,PDO::PARAM_STR);
        $stmt1->bindParam("date_rated", $date_rated,PDO::PARAM_STR);
        $stmt1->execute();
        $ratings = _getDataFromTable('Ratings');

        $db = null;
        if($ratings){
            $ratings = json_encode($ratings);
            echo '{"data": ' .$ratings . '}';
        }else {
           echo '{"data": ' . json_encode([]) . '}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateAppointmentStatus() {
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $db = getDB();
    $appointments = '';
    $candidate_id_fk = $data->candidate_id_fk;
    $recruiter_id_fk = $data->recruiter_id_fk;
    $status = $data->status;
    $date_created = $data->date_created;

    try {
        $sql1 = "UPDATE Appointments SET status=:status, date_created=:date_created WHERE recruiter_id_fk=:recruiter_id_fk AND candidate_id_fk=:candidate_id_fk";
        $stmt1 = $db->prepare($sql1);

        $stmt1->bindParam("recruiter_id_fk", $recruiter_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("candidate_id_fk", $candidate_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("status", $status,PDO::PARAM_STR);
        $stmt1->bindParam("date_created", $date_created,PDO::PARAM_STR);
        $stmt1->execute();
        $appointments = _getDataFromTable('Appointments');

        $db = null;
        if($appointments){
            $appointments = json_encode($appointments);
            echo '{"data": ' .$appointments . '}';
        }else {
           echo '{"data": ' . json_encode([]) . '}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function getDataFromDB(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $tableName = $data->tableName;

    try {

        $users = '';
        $db = getDB();
        $sql = "SELECT * FROM $tableName WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo '{"data": ' . json_encode($users) . '}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function _getUserDetailsByEmail($email){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    try {
        $user = '';
        $db = getDB();
        $sql = "SELECT * FROM Users WHERE email='$email'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_OBJ);

        $db = null;
       return $user;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }

}

function _getDataFromTable($tableName){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    try {
        $user = '';
        $db = getDB();
        $sql = "SELECT * FROM $tableName WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $user = $stmt->fetchAll(PDO::FETCH_OBJ);

        $db = null;
       return $user;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }

}


?>