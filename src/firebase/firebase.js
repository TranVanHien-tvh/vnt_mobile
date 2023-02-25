var VNT = VNT || {};
import { ModuleContext } from "@/stores/module-const";
import commonFn from "@/commons/commonFunction";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export default VNT.VNTAnalytics = {
    /*
    * Khởi tạo Analytics
    */
    initVNTAnalytics() {
        try {
            // Your web app's Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyDrF1mtcNMtqv-qDtr5-JQ4kLbMpUB0nLY",
                authDomain: "vietnam-together-a3e40.firebaseapp.com",
                projectId: "vietnam-together-a3e40",
                storageBucket: "vietnam-together-a3e40.appspot.com",
                messagingSenderId: "503143106933",
                appId: "1:503143106933:web:e41ea6d51623c94cd72b3c",
                measurementId: "G-5B7970FGZP"
            };

            const app = initializeApp(firebaseConfig);
            const analytics = getAnalytics(app);
            console.log('run firebase');
        } catch (e) {
            console.log(e);
        }
    },

    /**
   * Gửi dữ liệu lên fire base phục vụ monitor
   * @param {string} appName: Tên app (Học sinh, Khoản thu,...)
   * @param {string} groupType: Nghiệp vụ chính cần ghi log (Kế hoạch thu, Quản lý thu, Tổng kết,...)
   * @param {string} businessType: Nghiệp vụ chi tiết của nghiệp vụ chính (Đăng ký khoản thu, đợt thu,...)
   */
    logDataFireBase() {
        console.log('run firebase');
    },

    /**
     * Thực hiện gửi mã OTP bằng firebase
     * tvhien 27/08/2022
     */
    sendOTPWithFirebase(phone, isSendOTP) {
        const auth = getAuth();
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container',{}, auth);
        window.recaptchaVerifier.render().then((widgetId) => {
            window.recaptchaWidgetId = widgetId
        }, auth);
        const appVerifier = window.recaptchaVerifier;
        console.log(appVerifier);
        var arrayPhone = phone?.split('');
        arrayPhone[0] = '+84';
        phone = arrayPhone?.join('');
        console.log(phone);
        signInWithPhoneNumber(auth, phone, appVerifier)
            .then((confirmationResult) => {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                const confirmResult = confirmationResult;
                console.log(confirmResult);
                isSendOTP = true;
            }).catch((error) => {
                isSendOTP = false;
                console.log("er", error);
            });
    },

    /**
     * Khởi tạo ngôn ngữ và recapcha
     */
    setLanguageAndReCapcha() {
        const auth = getAuth();
        auth.useDeviceLanguage();
        // firebase.auth().useDeviceLanguage();
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                // console.log(response)
            }
        }, auth);
    }
};

VNT.VNTAnalytics.initVNTAnalytics();


