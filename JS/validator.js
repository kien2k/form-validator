function Validator(options) {

    var selectorRules = {};
   
    function validate(inputElement, rule) {
        var formMessage = inputElement.closest(options.formSelector).querySelector(options.errorSelector)
        var errorMessage;
        
        // lấy tất cả các rules của selector
        var rules = selectorRules[rule.selector]

        //lặp qua từng rule và kiểm tra giá trị
        //nếu có lỗi thì dừng việc kiểm tra
        for( var i = 0; i< rules.length; ++i) {
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector +':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
                
            if(errorMessage)  break;
        }   

        
        if(errorMessage) {
            formMessage.innerText = errorMessage;
            inputElement.closest(options.formSelector).classList.add('invalid');
        } else {
            formMessage.innerText = " ";
            inputElement.closest(options.formSelector).classList.remove('invalid');
        }

        return !errorMessage
    }

    //lấy element của form cần validate
    var formElement = document.querySelector(options.form)
        if(formElement) {

            // xử lí khi submit form 
            formElement.onsubmit = function(e) {
                e.preventDefault()
                
                var isFormValid = true;
                options.rules.forEach(function(rule) {
                    var inputElement = formElement.querySelector(rule.selector)
                    var isValid = validate(inputElement, rule)
                    if(!isValid) {
                        isFormValid = false
                    }
                })

                if (isFormValid) {
                    if(typeof options.onSubmit === 'function') {
                        var enableInputs = formElement.querySelectorAll('[name]:not(disable)')
                        var formValid = Array.from(enableInputs).reduce(function(values, input) {
                            switch(input.type) {
                                 case 'radio':
                                    values[input.name] = formElement.querySelector('input[name="gender"]:checked').value;
                                    break
                                case 'checkbox':
                                    if(input.matches(':checked')){
                                        if(!Array.isArray(values[input.name])) {
                                            values[input.name] = []
                                        }
                                        values[input.name].push(input.value)
                                     }
                                    if (!values[input.name]) {
                                        values[input.name] = "";
                                    }
                                        
                                    break;
                                case 'file':
                                    values[input.name] = input.files
                                    break;
                                default:
                                    values[input.name] = input.value
                            }
                        return values
                        }, {})
                        options.onSubmit(formValid)
                    }
                    else {
                        formElement.submit()
                    }
                }
        
            }

                //lặp qua các rule và xử lí( lắng nghe sự kiện blur, input,...)
            options.rules.forEach(function(rule) {
                var inputElements = formElement.querySelectorAll(rule.selector)

                //lưu lại các rule cho mỗi input
                if(Array.isArray(selectorRules[rule.selector])) {
                    selectorRules[rule.selector].push(rule.test)
                }
                else {
                    selectorRules[rule.selector] = [rule.test]
                }

                Array.from(inputElements).forEach(function(inputElement) {
                    if(inputElement) {
                        var formMessage = inputElement.closest(options.formSelector).querySelector(options.errorSelector)
                        
                        //xử lí khi blur khỏi input
                        inputElement.onblur = function() {
                            validate(inputElement, rule)
                        }
                        
                        
                        //xử lí khi nhập vào input
                        inputElement.oninput = function() {
                            formMessage.innerText = " ";
                            inputElement.closest(options.formSelector).classList.remove('invalid');
                        }
                
                    }
                })

            })
        }
}

Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || "Vui lòng nhập giá trị vào ô này"
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || "Vui lòng nhập email hợp lệ"
        }

    }
}

Validator.MinLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }

    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || "Giá trị nhập vào không chính xác"
        }
    }
}


