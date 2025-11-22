import React,{useEffect, useState} from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import IncomeOverview from '../../components/Income/IncomeOverview';
import { data } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import Modal from '../../components/Layout/Modal';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import { toast } from 'react-hot-toast';
import IncomeList from '../../components/Income/IncomeList';
import DeleteAlert from '../../components/Layout/DeleteAlert';
import { useUserAuth } from '../../hooks/useUserAuth';
const Income = () => {
  useUserAuth();
  const [openAddIncomeModal, setOpenAddIncomeModal]=useState(false);
  const [loading,setLoading]=useState(false);
  const [openDeleteAlert,setOpenDeleteAlert]=useState({
    show:false,
    data:null,
  });
  const [incomeData,setIncomeData]=useState([]);

  const fetchIncomeDetails=async()=>{
    if(loading) return;

    setLoading(true);

    try {
      const response=await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`);
      if (response.data) {
        console.log('Income API response:', response.data); // Debug log
        setIncomeData(response.data.income || []);
      }

    } catch (error) {
      console.log("Something went wrong while fetching income details. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome=async(income)=>{
    const {source,amount,date,icon}=income;
    if(!source || !source.trim()){
      toast.error("Source is required");
      return;
    }
    if(!amount || isNaN(amount) || Number(amount)<=0){
      toast.error("Please enter a valid amount");
      return;
    }
    if(!date){
      toast.error("Date is required");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME,{
        source,
        amount,
        date,
        icon
      });
      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      fetchIncomeDetails();
    } catch (error) {
      console.log("Something went wrong while adding income. Please try again.", error.response?.data.message || error.message );
    }
  };

  const deleteIncome=async(id)=>{
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      setOpenDeleteAlert({show:false,data:null});
      toast.success("Income deleted successfully");
      fetchIncomeDetails();
    } catch (error) {
      console.log("Something went wrong while deleting income. Please try again.", error.response?.data.message || error.message );
    }
  };

const handleDownloadIncomeDetails=async()=>{
    try {
      const response=await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME,{
        responseType:'blob',
      });
      
      console.log('Download response:', response); // Debug log
      
      const url=window.URL.createObjectURL(new Blob([response.data]));
      const link=document.createElement('a');
      link.href=url;
      link.setAttribute('download','income_details.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Income details downloaded successfully!');
    } catch (error) {
      console.error("Download error:", error); // Enhanced error logging
      toast.dismiss();
      toast.error("Failed to download income details. No Income details found." );
    }
  };

  useEffect(()=>{
    fetchIncomeDetails();
    return ()=>{};
  },[]);


  return (
    <DashboardLayout activeMenu="Income">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div>
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={()=>setOpenAddIncomeModal(true)}
            />
          </div>
        </div>
        <IncomeList
          transactions={incomeData}
          onDelete={(id)=>{
            setOpenDeleteAlert({show:true,data:id});
          }}
          onDownload={handleDownloadIncomeDetails}
        />
        <Modal 
          isOpen={openAddIncomeModal}
          onClose={()=>setOpenAddIncomeModal(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={()=>setOpenDeleteAlert({show:false,data:null})}
          title="Delete Income"
          >
            <DeleteAlert
            content="Are you sure you want to delete this income?"
            onDelete={()=>{
              deleteIncome(openDeleteAlert.data);
            }}            
            />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Income
