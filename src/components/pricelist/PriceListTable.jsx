// src/components/pricelist/PriceListTable.jsx
import {
    TableBody,
    TableCell,
    TableRow,
} from "@windmill/react-ui";
import { useEffect, useState } from "react";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import CheckBox from "@/components/form/others/CheckBox";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import PriceListDrawer from "@/components/drawer/PriceListDrawer";
import EditDeleteButton from "@/components/table/EditDeleteButton";

const PriceListTable = ({ isCheck, priceLists, setIsCheck }) => {
    const [updatedPriceLists, setUpdatedPriceLists] = useState([]);

    const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();

    const { showDateTimeFormat, globalSetting } = useUtilsFunction();

    const handleClick = (e) => {
        const { id, checked } = e.target;
        // Don't allow selecting default price lists
        const priceList = updatedPriceLists.find((pl) => pl._id === id);
        if (priceList?.isDefault) {
            return;
        }
        setIsCheck([...isCheck, id]);
        if (!checked) {
            setIsCheck(isCheck.filter((item) => item !== id));
        }
    };

    useEffect(() => {
        const result = priceLists?.map((el) => {
            const newDate = new Date(el?.updatedAt).toLocaleString("en-US", {
                timeZone: globalSetting?.default_time_zone,
            });
            const newObj = {
                ...el,
                updatedDate: newDate,
            };
            return newObj;
        });
        setUpdatedPriceLists(result);
    }, [priceLists, globalSetting?.default_time_zone]);

    return (
        <>
            {isCheck.length < 1 && <DeleteModal id={serviceId} title={title} />}

            {isCheck.length < 2 && (
                <MainDrawer maxWidth='570px'>
                    <PriceListDrawer id={serviceId} />
                </MainDrawer>
            )}

            <TableBody>
                {updatedPriceLists?.map((priceList, i) => (
                    <TableRow key={i + 1}>
                        <TableCell className='text-center'>
                            <CheckBox
                                type="checkbox"
                                name={priceList?.name}
                                id={priceList._id}
                                handleClick={handleClick}
                                isChecked={isCheck?.includes(priceList._id)}
                                disabled={priceList.isDefault}
                            />
                        </TableCell>

                        <TableCell className='text-center text-sm'>
                            {priceList.name}
                        </TableCell>

                        <TableCell className='text-center'>
                            <span className="text-sm">
                                {showDateTimeFormat(priceList.createdAt)}
                            </span>
                        </TableCell>

                        <TableCell className='text-center'>
                            <EditDeleteButton
                                id={priceList?._id}
                                isCheck={isCheck}
                                handleUpdate={handleUpdate}
                                handleModalOpen={handleModalOpen}
                                title={priceList?.name}
                                disabled={priceList.isDefault}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </>
    );
};

export default PriceListTable;

