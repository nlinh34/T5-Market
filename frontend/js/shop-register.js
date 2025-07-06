import { ShopAPI } from "../APIs/shopAPI.js";

async function checkExistingShop() {
    const shopCreationSection = document.getElementById('shopCreationSection');
    const container = document.querySelector('.shop-container');

    if (!shopCreationSection || !container) return;

    // Hide the form initially to prevent flash of content
    shopCreationSection.style.display = 'none';

    try {
        const response = await ShopAPI.getMyShop();
        if (response.success && response.data) {
            // Shop exists, hide form and show an informative message
            const existingShopMessage = document.createElement('div');
            existingShopMessage.className = 'has-shop-section'; // Use a class for styling
            
            let statusMessage = "Bạn có thể quản lý cửa hàng của mình tại đây.";
            let title = "Bạn đã có một cửa hàng!";

            switch (response.data.status) {
                case 'pending':
                    title = "Yêu cầu của bạn đang chờ duyệt";
                    statusMessage = "Yêu cầu đăng ký cửa hàng của bạn đã được ghi nhận và đang chờ quản trị viên phê duyệt. Vui lòng quay lại sau.";
                    break;
                case 'rejected':
                    title = "Yêu cầu của bạn đã bị từ chối";
                    statusMessage = "Yêu cầu đăng ký cửa hàng của bạn trước đó đã bị từ chối. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.";
                    break;
            }

            existingShopMessage.innerHTML = `
                <div class="shop-dashboard" style="text-align: center; padding: 40px 20px;">
                    <i class="fas fa-store" style="font-size: 48px; color: var(--primary-color); margin-bottom: 20px;"></i>
                    <h3>${title}</h3>
                    <p style="max-width: 500px; margin: 0 auto 20px auto;">${statusMessage}</p>
                    <a href="./shop-manager.html" class="manage-shop-btn" style="display: inline-block; text-decoration: none;">Đi tới trang quản lý</a>
                </div>
            `;
            container.appendChild(existingShopMessage);
        } else {
            // This case might happen if API returns success: false but not an error (which is unlikely for getMyShop)
             shopCreationSection.style.display = 'block';
        }
    } catch (error) {
        // This is the expected case for a new user (API returns 404 Not Found)
        console.log("No existing shop found for this user. Displaying registration form.");
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

  // New: Choose Package Modal Elements
  // const choosePackageModal = document.getElementById("choosePackageModal");
  // const choosePackageCloseBtn = document.querySelector(".choose-package-close");
  // const packageRadios = document.querySelectorAll('input[name="package"]');
  // const confirmPackageBtn = document.querySelector(".confirm-package-btn");

  // New: Step 4 Edit buttons
  const editInfoBtn = document.querySelector("#step4 .btn-edit-info");
  const editPolicyBtn = document.querySelector("#step4 .btn-edit-policy");

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
      } else {
        stepEl.classList.remove("active");
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

      // Hide/show navigation buttons
      if (prevBtn) {
        prevBtn.style.display = currentImageIndex === 0 ? 'none' : 'flex';
      }
      if (nextBtn) {
        nextBtn.style.display = sliderImages.length > 1 && currentImageIndex === sliderImages.length - 1 ? 'none' : 'flex';
      } else {
        nextBtn.style.display = 'none'; // Hide if only one image
      }
    }
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

  // Universal notification display function
  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    let iconHtml = '';
    if (type === 'success') {
      iconHtml = '<i class="fas fa-check-circle"></i> ';
    } else if (type === 'error') {
      iconHtml = '<i class="fas fa-times-circle"></i> ';
    } else if (type === 'info') {
      iconHtml = '<i class="fas fa-info-circle"></i> ';
    } else if (type === 'warning') {
        iconHtml = '<i class="fas fa-exclamation-triangle"></i> '; // Warning icon
    }

    notification.innerHTML = iconHtml + message; // Add icon before the message

    // Calculate dynamic top position to prevent overlapping
    const existingNotifications = document.querySelectorAll('.notification');
    let currentOffset = 20; // Initial top offset from the top of the viewport
    existingNotifications.forEach(notif => {
        // Only consider notifications that are currently visible and not removed yet
        // We assume notifications are removed after their animation
        // Add height of existing notification plus a small margin (e.g., 10px)
        currentOffset += notif.offsetHeight + 10;
    });

    notification.style.top = `${currentOffset}px`;
    notification.style.right = `20px`; // Keep it aligned to the right

    document.body.appendChild(notification);

    // Automatically remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      // Optional: Re-adjust positions of other notifications after one is removed
      // This is more complex and might involve looping through remaining notifications
      // and recalculating their `top` based on their new relative positions.
      // For now, new notifications will just stack on top of the current highest one.
    }, 3000);
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

  // Event listener for the new "Chọn ảnh" button
  if (selectShopImagesBtn) {
    selectShopImagesBtn.addEventListener('click', () => {
      shopImagesInput.click(); // Trigger click on the hidden file input
    });
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
      // Load current policy values into modal inputs
      const policies = collectPolicyData();
      policies.forEach(policy => {
        if (policy.type === 'shipping' && shippingPolicyInput) { shippingPolicyInput.value = policy.value; shippingPolicyToggle.checked = true; handlePolicyToggle(shippingPolicyToggle, shippingPolicyInputGroup); }
        if (policy.type === 'warranty' && warrantyPolicyInput) { warrantyPolicyInput.value = policy.value; warrantyPolicyToggle.checked = true; handlePolicyToggle(warrantyPolicyToggle, warrantyPolicyInputGroup); }
        if (policy.type === 'return' && returnPolicyInput) { returnPolicyInput.value = policy.value; returnPolicyToggle.checked = true; handlePolicyToggle(returnPolicyToggle, returnPolicyInputGroup); }
        if (policy.type === 'installment' && installmentPolicyInput) { installmentPolicyInput.value = policy.value; installmentPolicyToggle.checked = true; handlePolicyToggle(installmentPolicyToggle, installmentPolicyInputGroup); }
        if (policy.type === 'tradein' && tradeinPolicyInput) { tradeinPolicyInput.value = policy.value; tradeinPolicyToggle.checked = true; handlePolicyToggle(tradeinPolicyToggle, tradeinPolicyInputGroup); }
        // For custom policies, re-add them if they exist
        if (policy.type === 'custom') {
            const existingCustomInput = customPolicyContainer.querySelector(`input[value="${policy.value}"]`);
            if (!existingCustomInput) {
                // If it doesn't exist, create it
                customPolicyCount++;
                const newPolicyHtml = `
                    <div class="policy-input-group custom-policy-input" data-custom-policy-id="${customPolicyCount}">
                        <input type="text" value="${policy.value}">
                        <button type="button" class="remove-custom-policy-btn" data-custom-policy-id="${customPolicyCount}">Xóa</button>
                    </div>
                `;
                customPolicyContainer.insertAdjacentHTML('beforeend', newPolicyHtml);
                const newRemoveBtn = customPolicyContainer.querySelector(`.remove-custom-policy-btn[data-custom-policy-id="${customPolicyCount}"]`);
                if (newRemoveBtn) {
                    newRemoveBtn.addEventListener('click', (event) => {
                        const policyIdToRemove = event.target.dataset.customPolicyId;
                        const policyElementToRemove = customPolicyContainer.querySelector(`.custom-policy-input[data-custom-policy-id="${policyIdToRemove}"]`);
                        if (policyElementToRemove) {
                            policyElementToRemove.remove();
                            customPolicyCount--;
                        }
                    });
                }
            }
        }
      });
    });
  }

  if (closePolicyModalBtn) {
    closePolicyModalBtn.addEventListener('click', () => {
      policyEditModal.style.display = 'none';
    });
  }

  if (cancelPolicyBtn) {
    cancelPolicyBtn.addEventListener('click', () => {
      policyEditModal.style.display = 'none';
    });
  }

  if (confirmPolicyBtn) {
    confirmPolicyBtn.addEventListener('click', () => {
      // Logic to save policies could go here (e.g., to a hidden input or local storage)
      // For now, simply close the modal
      policyEditModal.style.display = 'none';
    });
  }

  // Event listeners for form navigation buttons
  shopRegisterForm.addEventListener('click', async (event) => {
    if (event.target.classList.contains('next-step-btn')) {
      const nextStep = parseInt(event.target.dataset.nextStep);

      // Validation for Step 1 (only terms checkbox)
      if (currentStep === 1) {
        if (!acceptTermsCheckbox.checked) {
          showNotification('Vui lòng đồng ý với Điều khoản sử dụng của T5 Market.', 'error');
          return;
        }
        currentStep++; // Move to next step
      }
      // Validation for Step 2 (shop info fields) and API call
      else if (currentStep === 2) {
        let isValid = true;

        // Validate Avatar (only check if file exists, actual loading handled in registerShopHandler)
        if (!avatarInput.files || avatarInput.files.length === 0) {
            // Also check if there's an existing data URL in avatarPreview.src
            if (!(avatarPreview.src && avatarPreview.src.startsWith("data:image"))) {
                showNotification("Vui lòng chọn ảnh đại diện.", 'warning');
                isValid = false;
            }
        }

        if (shopNameInput.value.trim() === '') {
          toggleError(shopNameInput, true, shopNameError);
          showNotification("Vui lòng nhập tên cửa hàng.", 'warning');
          isValid = false;
        } else {
          toggleError(shopNameInput, false, shopNameError);
        }

        if (shopDescriptionInput.value.trim() === '') {
            toggleError(shopDescriptionInput, true, shopDescriptionError);
            showNotification("Vui lòng nhập mô tả cửa hàng.", 'warning');
            isValid = false;
        } else {
            toggleError(shopDescriptionInput, false, shopDescriptionError);
        }

        if (shopAddressInput.value.trim() === '') {
          toggleError(shopAddressInput, true, addressError);
          showNotification("Vui lòng nhập địa chỉ cửa hàng.", 'warning');
          isValid = false;
        } else {
          toggleError(shopAddressInput, false, addressError);
        }

        if (shopPhoneInput.value.trim() === '') {
          toggleError(shopPhoneInput, true, shopPhoneError);
          showNotification("Vui lòng nhập số điện thoại.", 'warning');
          isValid = false;
        } else {
          toggleError(shopPhoneInput, false, shopPhoneError);
        }

        if (!isValid) {
          return;
        }

        const registerShopHandler = async (avatarFile = null) => {
            let logoUrl = null;
            if (avatarFile) {
                try {
                    logoUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(avatarFile);
                    });
                } catch (error) {
                    showNotification('Lỗi đọc ảnh đại diện: ' + error.message, 'error');
                    return false; // Indicate failure
                }
            } else if (avatarPreview.src && avatarPreview.src.startsWith("data:image")) {
                // Use existing data URL if no new file is selected but preview has a data URL
                logoUrl = avatarPreview.src;
            }

            const shopData = {
                name: shopNameInput.value,
                address: shopAddressInput.value,
                phone: shopPhoneInput.value,
                description: shopDescriptionInput.value,
                policies: collectPolicyData(),
                logoUrl: logoUrl, // Assign the resolved logoUrl
            };

            try {
                const response = await ShopAPI.registerShop(shopData);
                if (response.success) {
                    showNotification('Đăng ký cửa hàng thành công!', 'success');
                    return true; // Indicate success
                } else {
                    // If API returns an error, show it and DO NOT advance step
                    showNotification(response.error || 'Đăng ký cửa hàng thất bại.', 'error');
                    return false; // Indicate failure
                }
            } catch (error) {
                console.error("Error registering shop:", error);
                let errorMessageText = "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
                let messageType = 'error';

                try {
                    // error.message is the raw JSON string from the server
                    const parsedError = JSON.parse(error.message);
                    if (parsedError && parsedError.error) {
                        if (parsedError.error.includes("Bạn đã gửi yêu cầu hoặc đã có shop.")) {
                            errorMessageText = "Bạn đã có yêu cầu đăng ký hoặc đã sở hữu một cửa hàng. Không cần đăng ký lại.";
                            messageType = 'warning';
                        } else {
                            errorMessageText = `Đăng ký thất bại: ${parsedError.error}`;
                        }
                    }
                } catch (e) {
                    // If parsing fails, it's not a JSON string. Use the raw message.
                    if (error.message) {
                        errorMessageText = `Đăng ký thất bại: ${error.message}`;
                    }
                }

                showNotification(errorMessageText, messageType);
                return false; // Indicate failure
            }
        };

        // Call handler, passing the file directly
        const registrationSuccess = await registerShopHandler(avatarInput.files.length > 0 ? avatarInput.files[0] : null);

        if (registrationSuccess) {
            currentStep++; // Only advance step if registerShopHandler explicitly returned true
        }
        updateFormStepUI();
      }
    }
    else if (event.target.classList.contains('prev-step-btn')) {
      currentStep--; // Go back to the previous step
    }

    updateFormStepUI();
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
      policyEditModal.style.display = 'block';
      // Scroll to policy section in modal if needed
      policyEditModal.querySelector('.policy-modal-content').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Handle "Quay lại trang chủ" button in Step 3 (formerly Step 4)
  const backToHomeBtn = document.querySelector(".back-to-home-btn");
  if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
          window.location.href = "../../index.html"; // Redirect to home page
      });
  }
});

// Add new utility functions here if needed
