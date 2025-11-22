import React from 'react'
import { useContext,useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
export const useUserAuth = () => {
    const {user,updateUser,clearUser,loading}=useContext(UserContext);
    const navigate=useNavigate();
    useEffect(()=>{
        if (loading || user) return;
        
        // Check if we have a token in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            // No token, redirect to login
            navigate("/login");
            return;
        }
        
        let isMounted = true; // To prevent state updates if the component is unmounted
        
        const fetchUserInfo=async()=>{
            try{
                const response=await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
                if(response.data && isMounted){
                    updateUser(response.data);
                }
            }catch(error){
                console.log("useUserAuth: Failed to fetch user info:", error);
                if (isMounted && error.response && error.response.status === 401){
                    // Only clear user on 401 (unauthorized), not on network errors
                    clearUser();
                    navigate("/login");
                }
            }
        };
        fetchUserInfo();
        
        return () => {
            isMounted = false;
        };
}
,[user,updateUser,clearUser,navigate,loading]);
};
