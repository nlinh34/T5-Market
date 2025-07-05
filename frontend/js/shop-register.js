document.addEventListener("DOMContentLoaded", () => {
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

  // Payment Method elements
  const paymentMethodSelect = document.getElementById("paymentMethod");
  const bankInfoDiv = document.getElementById("bankInfo");
  const accountNumberDiv = document.getElementById("accountNumber");

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
  const choosePackageModal = document.getElementById("choosePackageModal");
  const choosePackageCloseBtn = document.querySelector(".choose-package-close");
  const packageRadios = document.querySelectorAll('input[name="package"]');
  const confirmPackageBtn = document.querySelector(".confirm-package-btn");

  // New: Step 3 Payment Elements
  const selectedPackageTime = document.getElementById("selectedPackageTime");
  const selectedPackagePrice = document.getElementById("selectedPackagePrice");
  const summaryTotal = document.getElementById("summaryTotal");
  const summaryTax = document.getElementById("summaryTax");
  const summaryGrandTotal = document.getElementById("summaryGrandTotal");
  const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const confirmPaymentBtn = document.querySelector(".confirm-payment-btn");
  const backToHomeBtn = document.querySelector(".back-to-home-btn");

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
    const totalSteps = stepperSteps.length;
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.documentElement.style.setProperty('--stepper-progress-width', `${progressPercentage}%`);

    // Update summary information when navigating to Step 4
    if (currentStep === 4) {
      updateSummary();
    } else if (currentStep === 3) { // Update payment summary when navigating to Step 3
        updatePaymentSummary();
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
        policies.forEach(policy => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check-circle"></i> ${policy.value}`; // Use policy.value instead of policy.description
            summaryShopPoliciesList.appendChild(li);
        });
        noPolicyMessage.classList.add('hidden');
    } else {
        noPolicyMessage.classList.remove('hidden');
    }
  };

  // Helper function to get policy icon
  const getPolicyIcon = (policyType) => {
    switch (policyType) {
        case 'shipping': return 'fas fa-truck';
        case 'warranty': return 'fas fa-shield-alt';
        case 'return': return 'fas fa-exchange-alt';
        case 'installment': return 'fas fa-money-check-alt';
        case 'tradein': return 'fas fa-sync-alt';
        case 'custom': return 'fas fa-file-alt';
        default: return 'fas fa-info-circle';
    }
  };

  // Helper function to get policy display name
  const getPolicyName = (policyType) => {
    switch (policyType) {
        case 'shipping': return 'Vận chuyển';
        case 'warranty': return 'Bảo hành';
        case 'return': return 'Đổi trả';
        case 'installment': return 'Trả góp';
        case 'tradein': return 'Thu cũ';
        case 'custom': return 'Chính sách tùy chỉnh';
        default: return 'Thông tin khác';
    }
  };

  // Function to update payment summary in Step 3
  const updatePaymentSummary = () => {
    const selectedPackage = document.querySelector('input[name="package"]:checked');
    if (selectedPackage) {
        const price = parseInt(selectedPackage.dataset.price);
        let time = "";
        if (selectedPackage.value === "1_month") {
            time = "1 tháng";
        } else if (selectedPackage.value === "3_months") {
            time = "3 tháng";
        } else if (selectedPackage.value === "6_months") {
            time = "6 tháng";
        }

        selectedPackageTime.textContent = time;
        selectedPackagePrice.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

        const taxRate = 0.08; // 8% tax
        const tax = price * taxRate;
        const grandTotal = price + tax;

        summaryTotal.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        summaryTax.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tax);
        summaryGrandTotal.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal);

        confirmPaymentBtn.textContent = `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)} - THANH TOÁN`;
    }
  };

  // Function to handle policy toggle and input visibility
  const handlePolicyToggle = (toggle, inputGroup) => {
    if (toggle && inputGroup) {
      if (toggle.checked) {
        inputGroup.classList.remove("hidden");
      } else {
        inputGroup.classList.add("hidden");
      }
    }
  };

  // Add event listeners for policy toggles
  if (shippingPolicyToggle) {
    shippingPolicyToggle.addEventListener("change", () => handlePolicyToggle(shippingPolicyToggle, shippingPolicyInputGroup));
  }
  if (warrantyPolicyToggle) {
    warrantyPolicyToggle.addEventListener("change", () => handlePolicyToggle(warrantyPolicyToggle, warrantyPolicyInputGroup));
  }
  if (returnPolicyToggle) {
    returnPolicyToggle.addEventListener("change", () => handlePolicyToggle(returnPolicyToggle, returnPolicyInputGroup));
  }
  if (installmentPolicyToggle) {
    installmentPolicyToggle.addEventListener("change", () => handlePolicyToggle(installmentPolicyToggle, installmentPolicyInputGroup));
  }
  if (tradeinPolicyToggle) {
    tradeinPolicyToggle.addEventListener("change", () => handlePolicyToggle(tradeinPolicyToggle, tradeinPolicyInputGroup));
  }

  // Function to add a new custom policy field
  const addCustomPolicyField = () => {
    if (customPolicyCount < MAX_CUSTOM_POLICIES) {
      customPolicyCount++;
      const newPolicyHtml = `
            <div class="policy-input-group custom-policy-input" data-custom-policy-id="${customPolicyCount}">
                <input type="text" placeholder="Nhập chính sách tùy chỉnh ${customPolicyCount}">
                <button type="button" class="remove-custom-policy-btn" data-custom-policy-id="${customPolicyCount}">Xóa</button>
            </div>
        `;
      customPolicyContainer.insertAdjacentHTML('beforeend', newPolicyHtml);

      // Add event listener for the new remove button
      const newRemoveBtn = customPolicyContainer.querySelector(`.remove-custom-policy-btn[data-custom-policy-id="${customPolicyCount}"]`);
      if (newRemoveBtn) {
        newRemoveBtn.addEventListener('click', (event) => {
          const policyIdToRemove = event.target.dataset.customPolicyId;
          const policyElementToRemove = customPolicyContainer.querySelector(`.custom-policy-input[data-custom-policy-id="${policyIdToRemove}"]`);
          if (policyElementToRemove) {
            policyElementToRemove.remove();
            customPolicyCount--; // Decrement count
          }
        });
      }
    } else {
      alert(`Bạn chỉ có thể tạo tối đa ${MAX_CUSTOM_POLICIES} chính sách tùy chỉnh.`);
    }
  };

  // Add event listener for adding custom policy
  if (addCustomPolicyBtn) {
    addCustomPolicyBtn.addEventListener('click', addCustomPolicyField);
  }

  // Function to collect all active policy data
  const collectPolicyData = () => {
    const policies = [];

    // Shipping policy
    if (shippingPolicyToggle && shippingPolicyToggle.checked && shippingPolicyInput) {
      policies.push({ type: 'shipping', value: shippingPolicyInput.value });
    }

    // Warranty policy
    if (warrantyPolicyToggle && warrantyPolicyToggle.checked && warrantyPolicyInput) {
      policies.push({ type: 'warranty', value: warrantyPolicyInput.value });
    }

    // Return policy
    if (returnPolicyToggle && returnPolicyToggle.checked && returnPolicyInput) {
      policies.push({ type: 'return', value: returnPolicyInput.value });
    }

    // Installment policy
    if (installmentPolicyToggle && installmentPolicyToggle.checked && installmentPolicyInput) {
      policies.push({ type: 'installment', value: installmentPolicyInput.value });
    }

    // Trade-in policy
    if (tradeinPolicyToggle && tradeinPolicyToggle.checked && tradeinPolicyInput) {
      policies.push({ type: 'tradein', value: tradeinPolicyInput.value });
    }

    // Custom policies
    document.querySelectorAll('#customPolicyContainer .custom-policy-input input[type="text"]').forEach(input => {
      if (input.value.trim() !== '') {
        policies.push({ type: 'custom', value: input.value.trim() });
      }
    });

    return policies;
  };

  // Function to show notification
  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Initial setup when DOM is loaded
  updateFormStepUI();
  updateSlider();
  setupSingleImagePreview(avatarInput, avatarPreview);

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

  // Event Listeners for Navigation Buttons
  document.querySelectorAll(".next-step-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const nextStep = parseInt(button.dataset.nextStep);

      if (validateCurrentStep(currentStep)) {
        if (currentStep === 2) {
          choosePackageModal.style.display = 'flex'; // Show the modal
        } else {
          currentStep = nextStep;
          updateFormStepUI();
        }
      }
    });
  });

  document.querySelectorAll(".prev-step-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const prevStep = parseInt(button.dataset.prevStep);
      currentStep = prevStep;
      updateFormStepUI();
    });
  });

  // Slider navigation
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : sliderImages.length - 1;
      updateSlider();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentImageIndex = (currentImageIndex < sliderImages.length - 1) ? currentImageIndex + 1 : 0;
      updateSlider();
    });
  }

  // Terms checkbox validation for Step 1
  if (acceptTermsCheckbox) {
    shopRegisterForm.querySelector('.next-step-btn[data-next-step="2"]').disabled = !acceptTermsCheckbox.checked;
    acceptTermsCheckbox.addEventListener('change', () => {
      shopRegisterForm.querySelector('.next-step-btn[data-next-step="2"]').disabled = !acceptTermsCheckbox.checked;
    });
  }

  // Step 2: Toggle content visibility
  if (step2Header) {
    step2Header.addEventListener("click", () => {
      shopInfoContent.classList.toggle("hidden");
      if (toggleIcon) {
        toggleIcon.classList.toggle("fa-chevron-down");
        toggleIcon.classList.toggle("fa-chevron-up");
      }
    });
  }

  if (shopPolicyHeader) {
    shopPolicyHeader.addEventListener("click", () => {
      shopPolicyContent.classList.toggle("hidden");
      if (shopPolicyToggleIcon) {
        shopPolicyToggleIcon.classList.toggle("fa-chevron-down");
        shopPolicyToggleIcon.classList.toggle("fa-chevron-up");
      }
    });
  }

  if (shopImagesHeader) {
    shopImagesHeader.addEventListener("click", () => {
      shopImagesContent.classList.toggle("hidden");
      if (shopImagesToggleIcon) {
        shopImagesToggleIcon.classList.toggle("fa-chevron-down");
        shopImagesToggleIcon.classList.toggle("fa-chevron-up");
      }
    });
  }

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

  // Choose Package Modal Event Listeners
  if (confirmPackageBtn) {
      confirmPackageBtn.addEventListener('click', () => {
          // Close the package modal
          choosePackageModal.style.display = 'none';
          // Move to the next step (Step 3 to Step 4)
          currentStep = 3; // Now explicitly set to 3
          updateFormStepUI(); // This will also call updatePaymentSummary()
      });
  }

  if (choosePackageCloseBtn) {
    choosePackageCloseBtn.addEventListener('click', () => {
        choosePackageModal.style.display = 'none';
    });
  }

  // Update confirm payment button text based on selected package
  paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', updatePaymentSummary);
  });

  // Handle "THANH TOÁN" button click in Step 3
  if (confirmPaymentBtn) {
      confirmPaymentBtn.addEventListener('click', () => {
          // In a real application, you would process the payment here.
          // For now, simulate success and move to Step 4.
          currentStep = 4;
          updateFormStepUI();
          showNotification("Cửa hàng của bạn đã được đăng ký và đang chờ kiểm duyệt!", "success");
      });
  }

  // Handle "Quay lại trang chủ" button in Step 4
  if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
          window.location.href = "../../index.html"; // Redirect to home page
      });
  }

  // Event Listener for Edit Info button in Step 4
  if (editInfoBtn) {
      editInfoBtn.addEventListener('click', () => {
          currentStep = 2; // Go back to Step 2 (Settings)
          updateFormStepUI();
      });
  }

  // Event Listener for Edit Policy button in Step 4
  if (editPolicyBtn) {
      editPolicyBtn.addEventListener('click', () => {
          // Trigger the existing logic to open and populate the policy modal
          if (openPolicyModalBtn) {
              openPolicyModalBtn.click();
          } else {
              // Fallback: manually open modal and load policies if openPolicyModalBtn is not available
              policyEditModal.style.display = 'flex';
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
          }
      });
  }

  // Validation logic
  const validateCurrentStep = (step) => {
    let isValid = true;
    // Function to add/remove error class
    const toggleError = (element, hasError, errorMessageElement = null) => {
        if (element) {
            if (hasError) {
                element.classList.add("input-error");
            } else {
                element.classList.remove("input-error");
            }
        }
        if (errorMessageElement) {
            errorMessageElement.style.display = hasError ? "block" : "none";
        }
    };

    if (step === 1) {
        if (!acceptTermsCheckbox.checked) {
            showNotification("Vui lòng đồng ý với Điều khoản sử dụng của T5 Market.", "error");
            isValid = false;
        }
    } else if (step === 2) {
        let allFieldsFilled = true;

        // Check Shop Name
        if (shopNameInput.value.trim() === "") {
            toggleError(shopNameInput, true, shopNameError);
            allFieldsFilled = false;
        } else {
            toggleError(shopNameInput, false, shopNameError);
        }

        // Check Shop Address
        if (shopAddressInput.value.trim() === "") {
            toggleError(shopAddressInput, true, addressError);
            allFieldsFilled = false;
        } else {
            toggleError(shopAddressInput, false, addressError);
        }

        // Check Shop Phone
        if (shopPhoneInput.value.trim() === "") {
            toggleError(shopPhoneInput, true, shopPhoneError);
            allFieldsFilled = false;
        } else {
            toggleError(shopPhoneInput, false, shopPhoneError);
        }

        // Check Avatar
        if (avatarInput.files.length === 0) {
            toggleError(avatarPreview, true); // No specific text error for avatar, just border
            allFieldsFilled = false;
        } else {
            toggleError(avatarPreview, false);
        }

        // Check Shop Description
        if (shopDescriptionInput.value.trim() === "") {
            toggleError(shopDescriptionInput, true, shopDescriptionError);
            allFieldsFilled = false;
        } else {
            toggleError(shopDescriptionInput, false, shopDescriptionError);
        }

        if (!allFieldsFilled) {
            // showNotification("bắt buộc nhập đầy đủ tất cả.", "error"); // Removed generic message
            isValid = false;
        }
    } else if (step === 3) {
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPaymentMethod) {
            showNotification("Vui lòng chọn hình thức thanh toán.", "error");
            isValid = false;
        }
    }
    return isValid;
  };
});
