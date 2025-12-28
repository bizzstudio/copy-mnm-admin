const myTheme = {
  // Alert
  alert: {
    base: "p-4 pl-12 relative rounded-lg leading-5",
    withClose: "pr-12",
    success:
      "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
    danger: "bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-100",
    warning: "bg-yellow-50 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100",
    neutral: "bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    info: "bg-mainColor-superLight text-mainColor dark:bg-mainColor/20 dark:text-mainColor-light",
    icon: {
      base: "h-5 w-5",
      success: "text-emerald-600 dark:text-emerald-400",
      danger: "text-red-600 dark:text-red-400",
      warning: "text-yellow-600 dark:text-yellow-400",
      neutral: "text-gray-500 dark:text-gray-400",
      info: "text-mainColor dark:text-mainColor-light",
    },
  },
  // Pagination
  pagination: {
    base: "flex flex-col justify-between text-xs sm:flex-row text-gray-600 dark:text-gray-400",
  },
  // TableFooter
  tableFooter: {
    base: "px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white text-gray-500 dark:text-gray-400 dark:bg-gray-800",
  },
  // TableRow
  tableRow: {
    base: "",
  },
  // TableHeader
  tableHeader: {
    base: "text-xs font-semibold tracking-wide text-right text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
  },
  // TableContainer
  tableContainer: {
    base: "w-full border border-gray-200 dark:border-gray-700 rounded-lg",
  },
  // TableCell
  tableCell: {
    base: "px-4 py-2",
  },
  // TableBody
  tableBody: {
    base: "bg-white divide-y divide-gray-100 dark:divide-gray-700 dark:bg-gray-800 text-gray-800 dark:text-gray-400",
  },
  // DropdownItem
  // this is the <li> that lives inside the Dropdown <ul>
  // you're probably looking for the dropdownItem style inside button
  dropdownItem: {
    base: "mb-2 last:mb-0",
  },
  // Dropdown
  dropdown: {
    base: "absolute w-56 p-2 mt-2 text-gray-600 bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-100 rounded-lg shadow-md min-w-max-content",
    align: {
      left: "left-0",
      right: "right-0",
    },
  },
  // Avatar
  avatar: {
    base: "relative rounded-full inline-block",
    size: {
      large: "w-10 h-10",
      regular: "w-8 h-8",
      small: "w-6 h-6",
    },
  },
  // Modal
  modal: {
    base: "w-full bg-white rounded-lg dark:bg-gray-800 sm:rounded-lg m-4 sm:max-w-xl custom-modal",
  },
  // ModalBody
  modalBody: {
    base: "text-sm text-gray-800 dark:text-gray-400",
  },
  // ModalFooter
  modalFooter: {
    base: "flex items-center justify-center gap-2 px-6 py-3 flex-row bg-gray-50 dark:bg-gray-900 rounded-b-lg border-t border-gray-200 dark:border-gray-700",
  },
  // ModalHeader
  modalHeader: {
    base: "mt-4 mb-2 text-lg font-semibold text-gray-800 dark:text-gray-300",
  },
  // Badge
  badge: {
    base: "inline-flex px-2 text-xs font-medium leading-5 rounded-full",
    success:
      "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white",
    danger: "text-red-700 bg-red-100 dark:text-red-100 dark:bg-red-800",
    warning: "text-yellow-700 bg-yellow-100 dark:text-yellow-100 dark:bg-yellow-600",
    neutral: "text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-600",
    primary: "bg-mainColor text-white dark:bg-mainColor-light dark:text-white",
  },
  // Backdrop
  backdrop: {
    base: "fixed inset-0 z-40 flex items-end bg-black bg-opacity-50 dark:bg-opacity-70 items-center justify-center",
  },
  // Textarea
  textarea: {
    base: "block w-full border bg-gray-100 focus:bg-white text-sm dark:text-gray-300 rounded-md focus:outline-none p-3 dark:bg-gray-700 dark:focus:bg-gray-700",
    active:
      "border border-gray-200 dark:border-gray-600 dark:focus:border-gray-500",
    disabled: "cursor-not-allowed opacity-50 bg-gray-300 dark:bg-gray-800 dark:text-gray-500",
    valid:
      "border-mainColor dark:bg-gray-700 dark:border-mainColor-light focus:border-mainColor dark:focus:border-mainColor-light",
    invalid:
      "border-red-600 dark:bg-gray-700 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400",
  },
  // Select
  select: {
    base: "block w-full h-12 border bg-gray-100 px-2 py-1 text-sm dark:text-gray-300 focus:outline-none rounded-md form-select focus:bg-white dark:bg-gray-700 dark:focus:bg-gray-700",
    active:
      "focus:border-gray-200 border-gray-200 dark:border-gray-600 focus:shadow-none dark:focus:border-gray-500",
    select: "leading-5",
    disabled: "cursor-not-allowed opacity-50 bg-gray-300 dark:bg-gray-800 dark:text-gray-500",
    valid:
      "border-mainColor dark:bg-gray-700 dark:border-mainColor-light focus:border-mainColor dark:focus:border-mainColor-light",
    invalid:
      "border-red-600 dark:bg-gray-700 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400",
  },
  // Label
  label: {
    base: "block text-sm text-gray-800 dark:text-gray-400",
    // check and radio get this same style
    check: "inline-flex items-center",
    disabled: "opacity-50 cursor-not-allowed",
  },
  // Input
  input: {
    base: "block w-full h-12 border border-gray-200 px-3 py-1 text-sm focus:outline-none dark:text-gray-300 leading-5 rounded-md bg-gray-100 focus:bg-white dark:bg-gray-700 dark:focus:bg-gray-700",
    active:
      "focus:border-gray-300 dark:border-gray-600 dark:focus:border-gray-500",
    disabled:
      "border border-gray-400 cursor-not-allowed opacity-50 bg-gray-300 dark:bg-gray-800 dark:text-gray-500",
    valid:
      "border-mainColor dark:bg-gray-700 dark:border-mainColor-light focus:border-mainColor dark:focus:border-mainColor-light",
    invalid:
      "border-red-600 dark:bg-gray-700 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400",
    radio:
      "text-mainColor form-radio focus:border-mainColor focus:outline-none dark:text-mainColor-light",
    checkbox:
      "text-mainColor form-checkbox focus:border-mainColor focus:outline-none rounded dark:text-mainColor-light",
  },
  // HelperText
  helperText: {
    base: "text-xs",
    valid: "text-mainColor dark:text-mainColor-light",
    invalid: "text-red-600 dark:text-red-400",
  },
  // Card
  card: {
    base: "rounded-lg border border-gray-200 dark:border-gray-700",
    default: "bg-white dark:bg-gray-800",
  },
  cardBody: {
    base: "p-4",
  },
  // Button
  button: {
    base: "align-bottom inline-flex items-center justify-center gap-[5px] leading-5 transition-colors duration-150 font-medium focus:outline-none whitespace-nowrap",
    block: "w-full",
    size: {
      larger: "px-10 py-4 rounded-lg",
      large: "px-5 py-3 rounded-lg",
      regular: "px-4 py-2 rounded-lg",
      small: "px-3 py-1 rounded-md text-sm",
      icon: {
        larger: "p-4 rounded-lg",
        large: "p-3 rounded-lg",
        regular: "p-2 rounded-lg",
        small: "p-2 rounded-md",
      },
      pagination: "px-3 py-1 rounded-md text-xs",
    },
    // styles applied to the SVG icon
    icon: {
      larger: "h-5 w-5",
      large: "h-5 w-5",
      regular: "h-5 w-5",
      small: "h-3 w-3",
      left: "ml-2 -ml-1",
      right: "ml-2 -mr-1",
    },
    primary: {
      base: "text-white bg-mainColor border border-transparent dark:bg-mainColor-light dark:hover:bg-mainColor",
      active: "active:bg-mainColor-dark hover:bg-mainColor-dark dark:active:bg-mainColor dark:hover:bg-mainColor",
      disabled: "opacity-50 cursor-not-allowed dark:opacity-50",
    },
    modern: {
      base: "text-white bg-gray-800 border border-transparent dark:bg-gray-700",
      active: "active:bg-gray-800 hover:bg-gray-900 dark:active:bg-gray-600 dark:hover:bg-gray-600",
      disabled: "opacity-50 cursor-not-allowed dark:opacity-50",
    },
    outline: {
      base: "w-full text-gray-600 border-gray-200 border dark:text-gray-300 dark:border-gray-600 focus:outline-none",
      active:
        "rounded-lg border bg-gray-200 border-gray-200 px-4 flex items-center justify-center cursor-pointer h-12 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600",
      disabled: "opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-800 dark:text-gray-500",
    },

    link: {
      base: "text-gray-600 dark:text-gray-300 focus:outline-none border border-transparent",
      active:
        "active:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100",
      disabled: "opacity-50 cursor-not-allowed dark:opacity-50",
    },
    // this is the button that lives inside the DropdownItem
    dropdownItem: {
      base: "align-bottom inline-flex items-center justify-center gap-1.5 leading-5 transition-colors duration-150 font-medium focus:outline-none px-4 py-2 text-red-600 border border-red-300 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-800 dark:hover:text-white rounded-lg hover:bg-red-500 hover:text-white hover:border-red-600",
      disabled: "opacity-50 cursor-not-allowed disabled:hover:bg-transparent dark:opacity-50",
    },
  },
};
export default myTheme;