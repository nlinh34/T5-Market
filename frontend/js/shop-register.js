import { ShopAPI } from "../APIs/shopAPI.js";
import { showNotification } from '../APIs/utils/notification.js'; // Import the global notification function

async function checkExistingShop() {
    const shopCreationSection = document.getElementById('shopCreationSection');
    const container = document.querySelector('.shop-container');

    if (!shopCreationSection || !container) return;

    // Hide the form initially to prevent flash of content
    shopCreationSection.style.display = 'none';

    try {
        const response = await ShopAPI.getMyShop();
        if (response.success && response.data) {
            window.currentShopId = response.data._id; // Store the shop ID globally
            console.log(`[checkExistingShop] Shop found. Setting window.currentShopId: ${window.currentShopId}. Shop Status: ${response.data.status}`);
            // Shop exists, hide form and show an informative message
            const existingShopMessage = document.createElement('div');
            existingShopMessage.className = 'has-shop-section'; // Use a class for styling
            
            let statusMessage = "Bạn có thể quản lý cửa hàng của mình tại đây.";
            let title = "Bạn đã có một cửa hàng!";

            switch (response.data.status) {
                case 'pending':
                    title = "Yêu cầu của bạn đang chờ duyệt";
                    statusMessage = "Yêu cầu đăng ký cửa hàng của bạn đã được ghi nhận và đang chờ quản trị viên phê duyệt. Vui lòng quay lại sau.";
                    existingShopMessage.className = 'pending-approval-view';
                    existingShopMessage.innerHTML = `
                        <i class="fas fa-hourglass-half pending-icon"></i>
                        <h3>${title}</h3>
                        <p>${statusMessage}</p>
                        <a href="./shop-register.html" class="reload-btn">Tải lại trang</a>
                    `;
                    container.innerHTML = '';
                    container.appendChild(existingShopMessage);
                    return; // Exit after showing message

                case 'rejected':
                    {
                        title = "Yêu cầu của bạn đã bị từ chối";
                        const reason = response.data.rejectionReason ? `Lý do: ${response.data.rejectionReason}` : "Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.";
                        statusMessage = `Yêu cầu đăng ký cửa hàng của bạn đã bị từ chối. ${reason}`;
                        
                        existingShopMessage.className = 'rejected-view'; // Use a dedicated class for styling
                        existingShopMessage.innerHTML = `
                            <i class="fas fa-times-circle rejected-icon"></i>
                            <h3>${title}</h3>
                            <p>${statusMessage}</p>
                            <button id="create-shop-again-btn" class="retry-btn">Tạo lại yêu cầu</button>
                        `;
                        
                        container.appendChild(existingShopMessage);

                        const createAgainBtn = document.getElementById('create-shop-again-btn');
                        if (createAgainBtn) {
                            createAgainBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                existingShopMessage.remove(); // Remove message
                                shopCreationSection.style.display = 'block'; // Show form
                                window.currentShopId = null; // Clear shop ID to force re-submission via POST
                            });
                        }
                        return; // Stop further processing
                    }
            }

            // This part handles the 'approved' status
            existingShopMessage.className = 'approved-view';
            existingShopMessage.innerHTML = `
                <i class="fas fa-store approved-icon"></i>
                <h3>${title}</h3>
                <p>${statusMessage}</p>
                <a href="./shop-manager.html" class="manage-shop-btn">Đi tới trang quản lý</a>
            `;
            container.innerHTML = ''; // Clear container before appending
            container.appendChild(existingShopMessage);
        } else {
            // This case might happen if API returns success: false but not an error (which is unlikely for getMyShop)
             window.currentShopId = null; // Explicitly clear if no shop data
             console.log("[checkExistingShop] No shop data returned. Setting window.currentShopId to null.");
             shopCreationSection.style.display = 'block';
        }
    } catch (error) {
        // This is the expected case for a new user (API returns 404 Not Found)
        console.log("No existing shop found for this user. Displaying registration form.");
        window.currentShopId = null; // Explicitly clear if no shop found
        console.log("[checkExistingShop] API call failed (no shop found). Setting window.currentShopId to null.");
        shopCreationSection.style.display = 'block';
    }
}

document.addEventListener("DOMContentLoaded", () => {
  checkExistingShop();
  const shopRegisterForm = document.getElementById("shopRegisterForm");
  const stepperSteps = document.querySelectorAll(".stepper .step");
  const formSteps = document.querySelectorAll(".form-step");
  let currentStep = 1;

  // Image Slider elements
  const sliderWrapper = document.querySelector(".slider-wrapper");
  const sliderImages = document.querySelectorAll(".slider-wrapper img");
  const prevBtn = document.querySelector(".slider-btn.prev-btn");
  const nextBtn = document.querySelector(".slider-btn.next-btn");
  let currentImageIndex = 0;
  let autoSlideInterval; /* New: Variable to hold the auto-slide interval */
  const slideIntervalTime = 5000; /* New: Auto-slide interval in milliseconds */

  // Step 2 Toggle elements
  const step2Header = document.querySelector("#step2 .step-2-header");
  const shopInfoContent = document.querySelector("#step2 .shop-info-content");
  const toggleIcon = document.querySelector("#step2 .toggle-icon");

  const shopPolicyHeader = document.getElementById("shopPolicyHeader");
  const shopPolicyContent = document.getElementById("shopPolicyContent");
  const shopPolicyToggleIcon = shopPolicyHeader ? shopPolicyHeader.querySelector(".toggle-icon") : null;

  // New: Shop Images Toggle elements
  const shopImagesHeader = document.getElementById("shopImagesHeader");
  const shopImagesContent = document.getElementById("shopImagesContent");
  const shopImagesToggleIcon = shopImagesHeader ? shopImagesHeader.querySelector(".toggle-icon") : null;

  // Image Upload elements
  const coverImageInput = document.getElementById("coverImage");
  const coverImagePreview = document.getElementById("coverImagePreview");
  const avatarInput = document.getElementById("avatar");
  const avatarPreview = document.getElementById("avatarPreview");
  const shopImagesInput = document.getElementById("shopImages");
  const shopImagesPreview = document.getElementById("shopImagesPreview");
  const selectShopImagesBtn = document.querySelector(".btn-edit-images");

  // Terms checkbox
  const acceptTermsCheckbox = document.getElementById("acceptTerms");

  // Summary elements (for Step 4)
  const summaryShopAddress = document.getElementById("summaryShopAddress");
  const summaryShopPhone = document.getElementById("summaryShopPhone");
  const summaryAvatar = document.getElementById("summaryAvatar");
  const summaryShopPoliciesList = document.getElementById("summaryShopPoliciesList");
  const noPolicyMessage = document.getElementById("noPolicyMessage");
  const showPhoneNumberLink = document.querySelector(".show-phone-number-link");

  // Form fields for Step 2
  const shopNameInput = document.getElementById("shopName");
  const shopAddressInput = document.getElementById("shopAddress");
  const shopPhoneInput = document.getElementById("shopPhone");
  const shopPhone2Input = document.getElementById("shopPhone2");
  const shopPhone3Input = document.getElementById("shopPhone3");
  const shopDescriptionInput = document.getElementById("shopDescription");
  const shopWebsiteInput = document.getElementById("shopWebsite");
  const userEmail = "example@example.com"; // Placeholder: Replace with actual user email if available

  // Error message elements
  const addressError = document.getElementById("addressError");
  const shopNameError = document.getElementById("shopNameError");
  const shopDescriptionError = document.getElementById("shopDescriptionError");
  const shopPhoneError = document.getElementById("shopPhoneError");

  // Policy Modal Elements
  const policyEditModal = document.getElementById("policyEditModal");
  const openPolicyModalBtn = document.querySelector(".btn-edit-policy");
  const closePolicyModalBtn = policyEditModal.querySelector(".close-button");
  const cancelPolicyBtn = policyEditModal.querySelector(".cancel-policy-btn");
  const confirmPolicyBtn = policyEditModal.querySelector(".confirm-policy-btn");

  const shippingPolicyToggle = document.getElementById("shippingPolicyToggle");
  const shippingPolicyInputGroup = shippingPolicyToggle ? shippingPolicyToggle.closest(".policy-item").querySelector(".policy-input-group") : null;
  const shippingPolicyInput = document.getElementById("shippingPolicy");

  const warrantyPolicyToggle = document.getElementById("warrantyPolicyToggle");
  const warrantyPolicyInputGroup = warrantyPolicyToggle ? warrantyPolicyToggle.closest(".policy-item").querySelector(".policy-input-group") : null;
  const warrantyPolicyInput = document.getElementById("warrantyPolicy");

  const returnPolicyToggle = document.getElementById("returnPolicyToggle");
  const returnPolicyInputGroup = returnPolicyToggle ? returnPolicyToggle.closest(".policy-item").querySelector(".policy-input-group") : null;
  const returnPolicyInput = document.getElementById("returnPolicy");

  const installmentPolicyToggle = document.getElementById("installmentPolicyToggle");
  const installmentPolicyInputGroup = installmentPolicyToggle ? installmentPolicyToggle.closest(".policy-item").querySelector(".policy-input-group") : null;
  const installmentPolicyInput = document.getElementById("installmentPolicy");

  const tradeinPolicyToggle = document.getElementById("tradeinPolicyToggle");
  const tradeinPolicyInputGroup = tradeinPolicyToggle ? tradeinPolicyToggle.closest(".policy-item").querySelector(".policy-input-group") : null;
  const tradeinPolicyInput = document.getElementById("tradeinPolicy");

  const addCustomPolicyBtn = document.getElementById("addCustomPolicyBtn");
  const customPolicyContainer = document.getElementById("customPolicyContainer");
  let customPolicyCount = 0;
  const MAX_CUSTOM_POLICIES = 4; // Limit to 4 custom policies

  let policiesAtModalOpen = []; // New: To store policies when modal is opened for potential revert

  const editInfoBtn = document.querySelector("#step4 .btn-edit-info");
  const editPolicyBtn = document.querySelector("#step4 .btn-edit-policy");

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dipcjvi8x/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "t5market_assets";

const registerShopHandler = async (avatarFile = null) => {
    let logoUrl = null;

    if (avatarFile) {
        try {
            const compressedBase64 = await new Promise((resolve, reject) => {
                new Compressor(avatarFile, {
                    quality: 0.6,
                    maxWidth: 400,
                    convertSize: 500000,
                    success(result) {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = (err) => reject(err);
                        reader.readAsDataURL(result);
                    },
                    error(err) {
                        reject(err);
                    }
                });
            });

            // Upload lên Cloudinary
            const formData = new FormData();
            formData.append("file", compressedBase64);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            const uploadResponse = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadData.secure_url) throw new Error("Không upload được ảnh logo.");
            logoUrl = uploadData.secure_url;
        } catch (error) {
            showNotification(" Upload ảnh logo thất bại: " + error.message, "error");
            return false;
        }
    } else if (avatarPreview.src && !avatarPreview.src.startsWith("data:image")) {
        logoUrl = avatarPreview.src;
    }

    const shopData = {
        name: shopNameInput.value,
        address: shopAddressInput.value,
        phone: shopPhoneInput.value,
        description: shopDescriptionInput.value,
        logoUrl: logoUrl || "", // có thể là null nếu không upload mới
    };

    let submissionSuccess = false;
    try {
        let response;
        if (window.currentShopId) {
            response = await ShopAPI.updateShopProfile(shopData);
        } else {
            shopData.policies = collectPolicyData();
            response = await ShopAPI.requestUpgradeToSeller(shopData);
        }

        if (response.success) {
            if (response.data && response.data._id) {
                window.currentShopId = response.data._id;
            }
            showNotification("Cập nhật/Đăng ký cửa hàng thành công!", "success");
            submissionSuccess = true;
        } else {
            showNotification(response.error || " Thao tác thất bại.", "error");
        }
    } catch (error) {
        console.error("Lỗi submit shop:", error);
        let message = " Lỗi không xác định.";
        try {
            const parsed = JSON.parse(error.message);
            if (parsed?.error) {
                message = ` ${parsed.error}`;
            }
        } catch (_) {
            if (error.message) {
                message = ` ${error.message}`;
            }
        }
        showNotification(message, "error");
    }

    return submissionSuccess;
};


  // Function to update form step and stepper UI
  const updateFormStepUI = () => {
    // Update form steps visibility
    formSteps.forEach((step, index) => {
      if (index + 1 === currentStep) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });

    // Update stepper active state
    stepperSteps.forEach((stepEl) => {
      const stepNumber = parseInt(stepEl.dataset.step);
      if (stepNumber === currentStep) {
        stepEl.classList.add("active");
        stepEl.classList.remove("completed"); /* Ensure active step is not also completed */
      } else if (stepNumber < currentStep) { /* New: Mark steps before current as completed */
        stepEl.classList.remove("active");
        stepEl.classList.add("completed");
      } else {
        stepEl.classList.remove("active", "completed"); /* New: Remove both for future steps */
      }
    });

    // Update stepper progress line width
    const totalSteps = 3; // Hardcode to 3 steps
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.documentElement.style.setProperty('--stepper-progress-width', `${progressPercentage}%`);

    // Update summary information when navigating to Step 3 (formerly Step 4)
    if (currentStep === 3) {
      updateSummary();
    }
  };

  // Function to update image slider display
  const updateSlider = () => {
    if (sliderImages.length > 0 && sliderWrapper) {
      const imageWidth = sliderImages[0].clientWidth; // Assuming all images have same width
      sliderWrapper.style.transform = `translateX(${-currentImageIndex * imageWidth}px)`;

      // New: Hide/show navigation buttons only if there's more than one image
      if (sliderImages.length > 1) {
        if (prevBtn) {
            prevBtn.style.display = 'flex';
        }
        if (nextBtn) {
            nextBtn.style.display = 'flex';
        }
      } else {
        if (prevBtn) {
            prevBtn.style.display = 'none';
        }
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
      }
    }
  };

  /* New: Function to start auto-sliding */
  const startAutoSlide = () => {
    if (sliderImages.length > 1) {
        updateSlider(); /* Display first image immediately */
        autoSlideInterval = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % sliderImages.length;
            updateSlider();
        }, slideIntervalTime);
    }
  };

  /* New: Function to stop auto-sliding */
  const stopAutoSlide = () => {
    clearInterval(autoSlideInterval);
  };

  // Function to setup image preview for single file inputs (cover/avatar)
  const setupSingleImagePreview = (inputElement, previewElement) => {
    if (inputElement && previewElement) {
      inputElement.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewElement.src = e.target.result;
            if (inputElement.id === 'avatar') { // Save avatar to session storage
                sessionStorage.setItem('shopAvatarData', e.target.result);
                previewElement.style.display = 'block'; // Ensure the image is displayed
            }
          };
          reader.readAsDataURL(file);
        } else {
          previewElement.src = "../../assests/images/default-product.png"; // Default image if no file
          if (inputElement.id === 'avatar') { // Clear avatar from session storage
            sessionStorage.removeItem('shopAvatarData');
            previewElement.style.display = 'block'; // Ensure the default image is displayed
          }
        }
      });
    }
  };

  // Function to setup multiple image preview for shop images
  const setupMultipleImagePreview = (inputElement, previewContainer) => {
    if (inputElement && previewContainer) {
      inputElement.addEventListener("change", (event) => {
        previewContainer.innerHTML = ''; // Clear existing previews
        Array.from(event.target.files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = "Shop Image";
            previewContainer.appendChild(img);
          };
          reader.readAsDataURL(file);
        });
      });
    }
  };

  // Function to collect data and update summary on Step 4
  const updateSummary = () => {
    // Step 2 data
    document.getElementById("summaryShopName").textContent = shopNameInput.value;
    summaryShopDescription.textContent = shopDescriptionInput.value || "Không có mô tả";
    summaryShopAddress.textContent = shopAddressInput.value;

    // Handle phone number display and 'Hiện số' link
    let fullPhoneNumber = shopPhoneInput.value;
    if (shopPhone2Input.value.trim() !== '') { fullPhoneNumber += `, ${shopPhone2Input.value}`; }
    if (shopPhone3Input.value.trim() !== '') { fullPhoneNumber += `, ${shopPhone3Input.value}`; }

    summaryShopPhone.textContent = fullPhoneNumber.substring(0, fullPhoneNumber.length - 4) + '****'; // Mask last 4 digits
    if (showPhoneNumberLink) {
        showPhoneNumberLink.dataset.fullPhone = fullPhoneNumber;
        showPhoneNumberLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (summaryShopPhone.textContent.includes('****')) {
                summaryShopPhone.textContent = showPhoneNumberLink.dataset.fullPhone;
                showPhoneNumberLink.textContent = 'Ẩn số';
            } else {
                summaryShopPhone.textContent = fullPhoneNumber.substring(0, fullPhoneNumber.length - 4) + '****';
                showPhoneNumberLink.textContent = 'Hiện số';
            }
        });
    }

    // Image previews
    const storedAvatarData = sessionStorage.getItem('shopAvatarData');
    if (storedAvatarData) {
      summaryAvatar.src = storedAvatarData;
      summaryAvatar.style.display = 'block';
    } else if (avatarPreview.src && avatarPreview.src.startsWith("data:image")) {
      summaryAvatar.src = avatarPreview.src;
      summaryAvatar.style.display = 'block';
    } else {
      summaryAvatar.src = "../../assests/images/default-product.png"; // Reset to default if no image
      summaryAvatar.style.display = 'block'; // Always display default product image
    }

    // Shop policies (assuming collectPolicyData already updates summaryShopPoliciesList)
    const policies = collectPolicyData();
    summaryShopPoliciesList.innerHTML = ''; // Clear existing policies

    if (policies.length > 0) {
      noPolicyMessage.style.display = 'none';
      policies.forEach((policy) => {
        const listItem = document.createElement("li");
        const policyIcon = getPolicyIcon(policy.type); // Function to get icon
        const policyName = getPolicyName(policy.type); // Function to get display name
        listItem.innerHTML = `<i class="${policyIcon}"></i> <strong>${policyName}:</strong> ${policy.value}`;
        summaryShopPoliciesList.appendChild(listItem);
      });
    } else {
      noPolicyMessage.style.display = 'block';
    }

    // Update current user email (if it's not a placeholder)
    const currentUserEmailElement = document.getElementById("summaryUserEmail");
    if (currentUserEmailElement) {
        currentUserEmailElement.textContent = userEmail; // Use the placeholder or actual user email
    }
  };

  // Function to get policy icon class based on type
  const getPolicyIcon = (policyType) => {
    switch (policyType) {
      case "shipping": return "fas fa-truck";
      case "warranty": return "fas fa-shield-alt";
      case "return": return "fas fa-undo";
      case "installment": return "fas fa-credit-card";
      case "tradein": return "fas fa-exchange-alt";
      case "custom": return "fas fa-info-circle";
      default: return "fas fa-question-circle";
    }
  };

  // Function to get policy display name based on type
  const getPolicyName = (policyType) => {
    switch (policyType) {
      case "shipping": return "Chính sách vận chuyển";
      case "warranty": return "Chính sách bảo hành";
      case "return": return "Chính sách đổi trả";
      case "installment": return "Chính sách trả góp";
      case "tradein": return "Chính sách thu cũ đổi mới";
      case "custom": return "Chính sách khác";
      default: return "Chính sách không xác định";
    }
  };

  // Function to handle policy toggle and input visibility
  const handlePolicyToggle = (toggle, inputGroup) => {
    if (toggle && inputGroup) {
      // Initial state
      if (toggle.checked) {
        inputGroup.classList.remove("hidden");
      } else {
        inputGroup.classList.add("hidden");
      }
      // Add change listener
      toggle.addEventListener('change', () => {
        if (toggle.checked) {
          inputGroup.classList.remove("hidden");
        } else {
          inputGroup.classList.add("hidden");
          // Clear input value when policy is unchecked
          const inputField = inputGroup.querySelector('input[type="text"]');
          if (inputField) {
            inputField.value = '';
          }
        }
      });
    }
  };

  // Function to add a new custom policy input field
  const addCustomPolicyField = () => {
    if (customPolicyCount >= MAX_CUSTOM_POLICIES) {
      showNotification(`Chỉ được phép thêm tối đa ${MAX_CUSTOM_POLICIES} chính sách tùy chỉnh.`, "error");
      return;
    }
    customPolicyCount++;
    const newPolicyHtml = `
            <div class="policy-input-group custom-policy-input" data-custom-policy-id="${customPolicyCount}">
                <input type="text" placeholder="Tên chính sách tùy chỉnh và mô tả" value="">
                <button type="button" class="remove-custom-policy-btn" data-custom-policy-id="${customPolicyCount}">Xóa</button>
            </div>
        `;
    customPolicyContainer.insertAdjacentHTML('beforeend', newPolicyHtml);

    // Add event listener to the new remove button
    const newRemoveBtn = customPolicyContainer.querySelector(`.remove-custom-policy-btn[data-custom-policy-id="${customPolicyCount}"]`);
    if (newRemoveBtn) {
      newRemoveBtn.addEventListener('click', (event) => {
        const policyIdToRemove = event.target.dataset.customPolicyId;
        const policyElementToRemove = customPolicyContainer.querySelector(`.custom-policy-input[data-custom-policy-id="${policyIdToRemove}"]`);
        if (policyElementToRemove) {
          policyElementToRemove.remove();
          customPolicyCount--; // Decrement count on removal
        }
      });
    }
  };

  // Function to collect all policy data from the modal
  const collectPolicyData = () => {
    const policies = [];

    const addPolicyIfChecked = (toggle, input) => {
      if (toggle && toggle.checked && input && input.value.trim() !== '') {
        policies.push({ type: toggle.id.replace("PolicyToggle", "").toLowerCase(), value: input.value.trim() });
      }
    };

    addPolicyIfChecked(shippingPolicyToggle, shippingPolicyInput);
    addPolicyIfChecked(warrantyPolicyToggle, warrantyPolicyInput);
    addPolicyIfChecked(returnPolicyToggle, returnPolicyInput);
    addPolicyIfChecked(installmentPolicyToggle, installmentPolicyInput);
    addPolicyIfChecked(tradeinPolicyToggle, tradeinPolicyInput);

    // Collect custom policies
    customPolicyContainer.querySelectorAll('.custom-policy-input input[type="text"]').forEach(input => {
      if (input.value.trim() !== '') {
        policies.push({ type: 'custom', value: input.value.trim() });
      }
    });
    return policies;
  };

  // Helper to show/hide error messages
  const toggleError = (element, hasError, errorMessageElement = null) => {
    if (hasError) {
      element.classList.add("input-error");
      if (errorMessageElement) errorMessageElement.style.display = 'block';
    } else {
      element.classList.remove("input-error");
      if (errorMessageElement) errorMessageElement.style.display = 'none';
    }
  };

  // Initial setup when DOM is loaded
  updateFormStepUI();
  updateSlider();
  setupSingleImagePreview(avatarInput, avatarPreview);
  setupMultipleImagePreview(shopImagesInput, shopImagesPreview);
  startAutoSlide(); /* New: Start auto-sliding on load */

  // New: Event listeners for slider navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoSlide(); /* Stop auto-slide on manual navigation */
      currentImageIndex = (currentImageIndex - 1 + sliderImages.length) % sliderImages.length;
      updateSlider();
      startAutoSlide(); /* Resume auto-slide after a brief pause */
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoSlide(); /* Stop auto-slide on manual navigation */
      currentImageIndex = (currentImageIndex + 1) % sliderImages.length;
      updateSlider();
      startAutoSlide(); /* Resume auto-slide after a brief pause */
    });
  }

  // New: Pause auto-slide on hover over intro-images
  const introImagesSection = document.querySelector(".intro-images");
  if (introImagesSection) {
    introImagesSection.addEventListener('mouseenter', stopAutoSlide);
    introImagesSection.addEventListener('mouseleave', startAutoSlide);
  }

  // Event listener for the new "Chọn ảnh" button
  if (selectShopImagesBtn) {
    selectShopImagesBtn.addEventListener('click', () => {
      shopImagesInput.click(); // Trigger click on the hidden file input
    });
  }

  // Event listener for adding a new custom policy field
  if (addCustomPolicyBtn) {
    addCustomPolicyBtn.addEventListener('click', addCustomPolicyField);
  }

  // Initialize policy input group visibility based on toggle state
  handlePolicyToggle(shippingPolicyToggle, shippingPolicyInputGroup);
  handlePolicyToggle(warrantyPolicyToggle, warrantyPolicyInputGroup);
  handlePolicyToggle(returnPolicyToggle, returnPolicyInputGroup);
  handlePolicyToggle(installmentPolicyToggle, installmentPolicyInputGroup);
  handlePolicyToggle(tradeinPolicyToggle, tradeinPolicyInputGroup);

  // Policy Modal Event Listeners
  if (openPolicyModalBtn) {
    openPolicyModalBtn.addEventListener('click', () => {
      policyEditModal.style.display = 'flex'; // Use flex to enable centering

      // 1. Store current policies when modal is opened for potential revert
      policiesAtModalOpen = collectPolicyData();

      // 2. Clear all current modal inputs before populating
      shippingPolicyToggle.checked = false; shippingPolicyInput.value = ''; handlePolicyToggle(shippingPolicyToggle, shippingPolicyInputGroup);
      warrantyPolicyToggle.checked = false; warrantyPolicyInput.value = ''; handlePolicyToggle(warrantyPolicyToggle, warrantyPolicyInputGroup);
      returnPolicyToggle.checked = false; returnPolicyInput.value = ''; handlePolicyToggle(returnPolicyToggle, returnPolicyInputGroup);
      installmentPolicyToggle.checked = false; installmentPolicyInput.value = ''; handlePolicyToggle(installmentPolicyToggle, installmentPolicyInputGroup);
      tradeinPolicyToggle.checked = false; tradeinPolicyInput.value = ''; handlePolicyToggle(tradeinPolicyToggle, tradeinPolicyInputGroup);
      customPolicyContainer.innerHTML = ''; // Clear custom policies
      customPolicyCount = 0; // Reset custom policy count

      // 3. Populate modal inputs with policiesAtModalOpen
      policiesAtModalOpen.forEach(policy => {
        if (policy.type === 'shipping' && shippingPolicyInput) { shippingPolicyInput.value = policy.value; shippingPolicyToggle.checked = true; handlePolicyToggle(shippingPolicyToggle, shippingPolicyInputGroup); }
        else if (policy.type === 'warranty' && warrantyPolicyInput) { warrantyPolicyInput.value = policy.value; warrantyPolicyToggle.checked = true; handlePolicyToggle(warrantyPolicyToggle, warrantyPolicyInputGroup); }
        else if (policy.type === 'return' && returnPolicyInput) { returnPolicyInput.value = policy.value; returnPolicyToggle.checked = true; handlePolicyToggle(returnPolicyToggle, returnPolicyInputGroup); }
        else if (policy.type === 'installment' && installmentPolicyInput) { installmentPolicyInput.value = policy.value; installmentPolicyToggle.checked = true; handlePolicyToggle(installmentPolicyToggle, installmentPolicyInputGroup); }
        else if (policy.type === 'tradein' && tradeinPolicyInput) { tradeinPolicyInput.value = policy.value; tradeinPolicyToggle.checked = true; handlePolicyToggle(tradeinPolicyToggle, tradeinPolicyInputGroup); }
        else if (policy.type === 'custom') {
            // This will add new custom policy fields if they were in policiesAtModalOpen
            addCustomPolicyField(); // Call to create the div
            const lastCustomInput = customPolicyContainer.querySelector(`.custom-policy-input[data-custom-policy-id="${customPolicyCount}"] input[type="text"]`);
            if (lastCustomInput) {
                lastCustomInput.value = policy.value;
            }
        }
      });

      // Scroll to policy section in modal if needed (no change here)
      // policyEditModal.querySelector('.policy-modal-content').scrollIntoView({ behavior: 'smooth' }); // This line might be problematic if policy-modal-content doesn't exist
    });
  }

  if (closePolicyModalBtn) {
    closePolicyModalBtn.addEventListener('click', () => {
      policyEditModal.style.display = 'none';
      revertPoliciesToModalOpen(); // New: Revert policies on close
    });
  }

  if (cancelPolicyBtn) {
    cancelPolicyBtn.addEventListener('click', () => {
      policyEditModal.style.display = 'none';
      revertPoliciesToModalOpen(); // New: Revert policies on cancel
    });
  }

  // New: Function to revert policy modal inputs to policiesAtModalOpen state
  const revertPoliciesToModalOpen = () => {
      // Clear all current modal inputs
      shippingPolicyToggle.checked = false; shippingPolicyInput.value = ''; handlePolicyToggle(shippingPolicyToggle, shippingPolicyInputGroup);
      warrantyPolicyToggle.checked = false; warrantyPolicyInput.value = ''; handlePolicyToggle(warrantyPolicyToggle, warrantyPolicyInputGroup);
      returnPolicyToggle.checked = false; returnPolicyInput.value = ''; handlePolicyToggle(returnPolicyToggle, returnPolicyInputGroup);
      installmentPolicyToggle.checked = false; installmentPolicyInput.value = ''; handlePolicyToggle(installmentPolicyToggle, installmentPolicyInputGroup);
      tradeinPolicyToggle.checked = false; tradeinPolicyInput.value = ''; handlePolicyToggle(tradeinPolicyToggle, tradeinPolicyInputGroup);
      customPolicyContainer.innerHTML = ''; // Clear custom policies
      customPolicyCount = 0; // Reset custom policy count

      // Populate modal inputs with policiesAtModalOpen
      policiesAtModalOpen.forEach(policy => {
          if (policy.type === 'shipping' && shippingPolicyInput) { shippingPolicyInput.value = policy.value; shippingPolicyToggle.checked = true; handlePolicyToggle(shippingPolicyToggle, shippingPolicyInputGroup); }
          else if (policy.type === 'warranty' && warrantyPolicyInput) { warrantyPolicyInput.value = policy.value; warrantyPolicyToggle.checked = true; handlePolicyToggle(warrantyPolicyToggle, warrantyPolicyInputGroup); }
          else if (policy.type === 'return' && returnPolicyInput) { returnPolicyInput.value = policy.value; returnPolicyToggle.checked = true; handlePolicyToggle(returnPolicyToggle, returnPolicyInputGroup); }
          else if (policy.type === 'installment' && installmentPolicyInput) { installmentPolicyInput.value = policy.value; installmentPolicyToggle.checked = true; handlePolicyToggle(installmentPolicyToggle, installmentPolicyInputGroup); }
          else if (policy.type === 'tradein' && tradeinPolicyInput) { tradeinPolicyInput.value = policy.value; tradeinPolicyToggle.checked = true; handlePolicyToggle(tradeinPolicyToggle, tradeinPolicyInputGroup); }
          else if (policy.type === 'custom') {
              addCustomPolicyField(); // Call to create the div
              const lastCustomInput = customPolicyContainer.querySelector(`.custom-policy-input[data-custom-policy-id="${customPolicyCount}"] input[type="text"]`);
              if (lastCustomInput) {
                  lastCustomInput.value = policy.value;
              }
          }
      });
  };

  if (confirmPolicyBtn) {
    confirmPolicyBtn.addEventListener('click', async () => { // Make it async
      const policies = collectPolicyData();
      if (!window.currentShopId) {
          // If no current shop ID, just store policies locally and close modal
          // Policies will be submitted with the rest of the shop data during initial registration
          showNotification("Chính sách đã được lưu tạm thời.", "success");
          policyEditModal.style.display = 'none';
          updateSummary(); // Update summary with locally collected policies
          return;
      }
      try {
          const response = await ShopAPI.updateShopPolicies({ policies });
          if (response.success) {
              showNotification('Cập nhật chính sách thành công!', 'success');
              // Update summary after successful policy update
              updateSummary();
              policyEditModal.style.display = 'none';
          } else {
              showNotification(response.error || 'Cập nhật chính sách thất bại.', 'error');
          }
      } catch (error) {
          console.error("Error updating policies:", error);
          let errorMessageText = "Đã xảy ra lỗi không xác định khi cập nhật chính sách.";
          try {
              const parsedError = JSON.parse(error.message);
              if (parsedError && parsedError.error) {
                  errorMessageText = `Cập nhật chính sách thất bại: ${parsedError.error}`;
              }
          } catch (e) {
              if (error.message) {
                  errorMessageText = `Cập nhật chính sách thất bại: ${error.message}`;
              }
          }
          showNotification(errorMessageText, 'error');
      }
    });
  }

  // Event listeners for form navigation buttons
  shopRegisterForm.addEventListener('click', async (event) => {
    let shouldUpdateUI = false; // Flag to determine if UI update is needed
    let shouldAdvanceStep = false; // Flag to determine if step should advance

    if (event.target.classList.contains('next-step-btn')) {
      if (currentStep === 1) {
        if (!acceptTermsCheckbox.checked) {
          showNotification('Vui lòng đồng ý với Điều khoản sử dụng của T5 Market.', 'error');
          return; // Stop here, do not proceed or update UI
        }
        shouldAdvanceStep = true;
        shouldUpdateUI = true;
      } else if (currentStep === 2) {
        let isValid = true;

        // Validate Avatar
        if (!avatarInput.files || avatarInput.files.length === 0) {
            if (!(avatarPreview.src && avatarPreview.src.startsWith("data:image"))) {
                showNotification("Vui lòng chọn ảnh đại diện.", 'warning');
                isValid = false;
            }
        }

        // Validate other fields
        if (shopNameInput.value.trim() === '') { toggleError(shopNameInput, true, shopNameError); showNotification("Vui lòng nhập tên cửa hàng.", 'warning'); isValid = false; }
        else { toggleError(shopNameInput, false, shopNameError); }

        if (shopDescriptionInput.value.trim() === '') { toggleError(shopDescriptionInput, true, shopDescriptionError); showNotification("Vui lòng nhập mô tả cửa hàng.", 'warning'); isValid = false; }
        else { toggleError(shopDescriptionInput, false, shopDescriptionError); }

        if (shopAddressInput.value.trim() === '') { toggleError(shopAddressInput, true, addressError); showNotification("Vui lòng nhập địa chỉ cửa hàng.", 'warning'); isValid = false; }
        else { toggleError(shopAddressInput, false, addressError); }

        if (shopPhoneInput.value.trim() === '') { toggleError(shopPhoneInput, true, shopPhoneError); showNotification("Vui lòng nhập số điện thoại.", 'warning'); isValid = false; }
        else { toggleError(shopPhoneInput, false, shopPhoneError); }

        if (!isValid) {
          return; // Stop here if validation fails
        }

        const registrationSuccess = await registerShopHandler(avatarInput.files.length > 0 ? avatarInput.files[0] : null);
        if (registrationSuccess) {
          shouldAdvanceStep = true;
        }
        shouldUpdateUI = true; // Always update UI after attempting registration/update
      }
      // If currentStep is 3 (Summary), and next-step-btn is clicked, just advance
      if (shouldAdvanceStep) {
          currentStep++;
      }

    } else if (event.target.classList.contains('prev-step-btn')) {
      currentStep--;
      shouldUpdateUI = true;
    }

    if (shouldUpdateUI) {
      updateFormStepUI();
    }
  });

  // Event listeners for Step 3 (formerly Step 4) edit buttons
  if (editInfoBtn) {
    editInfoBtn.addEventListener('click', () => {
      currentStep = 2;
      updateFormStepUI();
      // Scroll to top of the form or relevant section if needed
      shopRegisterForm.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (editPolicyBtn) {
    editPolicyBtn.addEventListener('click', () => {
      currentStep = 2;
      updateFormStepUI();
      // Open policy modal immediately
      policyEditModal.style.display = 'flex'; // Use flex to enable centering
      // Scroll to policy section in modal if needed
      policyEditModal.querySelector('.policy-modal-content').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Handle "Quay lại trang chủ" button in Step 3 (formerly Step 4)
  const backToHomeBtn = document.querySelector(".back-to-home-btn");
  if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
          window.location.href = "./index.html"; // Redirect to home page
      });
  }
});
