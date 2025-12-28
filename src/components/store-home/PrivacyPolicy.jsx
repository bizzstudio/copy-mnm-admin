import { Button } from "@windmill/react-ui";
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";

// Internal import
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import Error from "@/components/form/others/Error";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import Uploader from "@/components/image-uploader/Uploader";

const PrivacyPolicy = ({
  isSave,
  errors,
  register,
  textEdit,
  setTextEdit,
  privacyPolicy,
  setPrivacyPolicy,
  setPrivacyPolicyHeaderBg,
  privacyPolicyHeaderBg,
  setTermsConditions,
  termsConditions,
  setTermsConditionsHeaderBg,
  termsConditionsHeaderBg,
  termsConditionsTextEdit,
  setTermsConditionsTextEdit,
  isSubmitting,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="col-span-12 md:col-span-12 lg:col-span-12 pr-4">
        <div className="flex justify-end items-center flex-shrink-0 space-x-6">
          <div className="fixed right-auto md:mb-6 mb-3 bottom-0 z-40">
            {isSubmitting ? (
              <Button disabled={true} type="button" className="h-10 px-6">
                <img
                  src={spinnerLoadingImage}
                  alt="Loading"
                  width={20}
                  height={10}
                />{" "}
                <span className="font-serif ml-2 font-light">
                  {" "}
                  {t("Processing")}
                </span>
              </Button>
            ) : (
              <Button type="submit" className="h-10 px-6 ">
                {" "}
                {isSave ? t("SaveBtn") : t("UpdateBtn")}
              </Button>
            )}
          </div>
        </div>

        <div className="inline-flex md:text-lg text-base text-gray-800 font-semibold dark:text-gray-400 md:mb-3 mb-1">
          <FiSettings className="mt-1 mx-2" />
          {t("PrivacyPolicyTermsTitle")}
        </div>

        <hr className="md:mb-10 mb-4" />

        <div className="xl:px-10 grow scrollbar-hide w-full max-h-full">
          <div className="inline-flex md:text-base text-sm md:mb-3 text-gray-500 dark:text-gray-400">
            <strong>{t("PrivacyPolicy")}</strong>
          </div>

          <hr className="md:mb-12 mb-3" />

          <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 md:mb-6 mb-3">
            <label className="block md:text-sm md:col-span-1 sm:col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:mb-1">
              {t("EnableThisBlock")}
            </label>
            <div className="sm:col-span-4">
              <SwitchToggle
                title=""
                handleProcess={setPrivacyPolicy}
                processOption={privacyPolicy}
                name={privacyPolicy}
              />
            </div>
          </div>

          <div
            id="description"
            className="mb-height-0"
            style={{
              height: privacyPolicy ? "auto" : 0,
              transition: "all 0.5s",
              visibility: !privacyPolicy ? "hidden" : "visible",
              opacity: !privacyPolicy ? "0" : "1",
            }}
          >
            <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 md:mb-6 mb-3 relative">
              <label className="block md:text-sm md:col-span-1 sm:col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:mb-1">
                {t("PageHeaderBg")}
              </label>
              <div className="sm:col-span-4">
                <Uploader
                  imageUrl={privacyPolicyHeaderBg}
                  setImageUrl={setPrivacyPolicyHeaderBg}
                  folder='privacyPolicy'
                />
              </div>
            </div>

            <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 md:mb-6 mb-3 relative">
              <label className="block md:text-sm md:col-span-1 sm:col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:mb-1">
                {t("PageTitle")}
              </label>
              <div className="sm:col-span-4">
                <InputAreaTwo
                  required
                  register={register}
                  label="Page Title"
                  name="privacy_page_title"
                  type="text"
                  placeholder={t("PageTitle")}
                />
                <Error errorName={errors.privacy_page_title} />
              </div>
            </div>

            <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 md:mb-6 mb-3 relative">
              <label className="block md:text-sm md:col-span-1 sm:col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:mb-1">
                {t("PageText")}
              </label>

              <div className="sm:col-span-4" dir="ltr">
                <ReactQuill
                  value={textEdit}
                  onChange={setTextEdit}
                  className="text-black dark:text-white"
                  theme="snow"
                  modules={{
                    toolbar: {
                      container: [
                        [{ 'header': [1, 2, 3, false] }],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link'],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                      ],
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="md:mb-12 mb-3" />

        <div className="xl:px-10 grow scrollbar-hide w-full max-h-full">
          <div className="inline-flex md:text-base text-sm mb-3 text-gray-500 dark:text-gray-400">
            <strong>{t("TermsConditions")}</strong>
          </div>
          <hr className="md:mb-10 mb-3" />

          <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 md:mb-6 mb-3">
            <label className="block md:text-sm md:col-span-1 sm:col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:mb-1">
              {t("EnableThisBlock")}
            </label>
            <div className="sm:col-span-4">
              <SwitchToggle
                title=""
                handleProcess={setTermsConditions}
                processOption={termsConditions}
                name={termsConditions}
              />
            </div>
          </div>

          <div
            style={{
              height: termsConditions ? "auto" : 0,
              transition: "all 0.5s",
              visibility: !termsConditions ? "hidden" : "visible",
              opacity: !termsConditions ? "0" : "1",
            }}
          >
            <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 md:mb-6 mb-3">
              <label className="block md:text-sm md:col-span-1 sm:col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:mb-1">
                {t("PageHeaderBg")}
              </label>
              <div className="sm:col-span-4">
                <Uploader
                  imageUrl={termsConditionsHeaderBg}
                  setImageUrl={setTermsConditionsHeaderBg}
                  folder='termsConditions'
                />
              </div>
            </div>

            <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 md:mb-6 mb-3">
              <label className="block md:text-sm md:col-span-1 sm:col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:mb-1">
                {t("PageTitle")}
              </label>
              <div className="sm:col-span-4">
                <InputAreaTwo
                  required
                  register={register}
                  label="Page Title"
                  name="termsConditions_page_title"
                  type="text"
                  placeholder={t("PageTitle")}
                />
                <Error errorName={errors.termsConditions_page_title} />
              </div>
            </div>

            <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 md:mb-6 mb-3">
              <label className="block md:text-sm md:col-span-1 sm:col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:mb-1">
                {t("PageText")}
              </label>
              <div className="sm:col-span-4" dir="ltr">
                <ReactQuill
                  value={termsConditionsTextEdit || ""}
                  onChange={setTermsConditionsTextEdit}
                  className="text-black dark:text-white"
                  theme="snow"
                  modules={{
                    toolbar: {
                      container: [
                        [{ 'header': [1, 2, 3, false] }],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link'],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                      ],
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
