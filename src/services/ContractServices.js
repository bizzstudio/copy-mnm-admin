// src/services/ContractServices.js
import requests from "./httpService";

const ContractServices = {
    listByCustomer: (mainCustomerId) =>
        requests.get(`/admin/contracts?mainCustomerId=${mainCustomerId}`),

    listAll: () => requests.get(`/admin/contracts`),
};

export default ContractServices;
