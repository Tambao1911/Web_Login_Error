
// Đối tượng 'validator'
function Validator(options){
    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    const selectorRules ={}

    // hàm Thực hiện validate
    function validate(inputElement, rule){
        const errorElement = getParent(inputElement , options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        // Lấy Ra Các Ruke của selector
        const rules = selectorRules[rule.selector];
        // Lặp qua từng rule & kiểm tra 
        // Nếu Có Lỗi thì dừn việc kiểm tra
        for(let i = 0; i < rules.length; i++){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement , options.formGroupSelector).classList.add('invalid')
        }
        else{
            errorElement.innerText =''
            getParent(inputElement , options.formGroupSelector).classList.remove('invalid')

        }
        return !errorMessage;

    }
    // Lấy element của form validate
    const formElement = document.querySelector(options.form)
    if(formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;
            // Thực hiện lặp qua từng rules va validate
            options.rules.forEach((rule)=>{
                const inputElement  = formElement.querySelector(rule.selector)
                const isValid =  validate(inputElement,rule)
                if(!isValid){
                    isFormValid = false
                }
            });
            
            if(isFormValid){
                // Trường Hợp submit với js
                if(typeof options.onSubmit === 'function'){
                    const enableInput = formElement.querySelectorAll('[name]')
                    const formValues = Array.from(enableInput).reduce((values , input)=>{
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] =''
                                    return values
                                } 
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] =[]
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values;
                    },{})
                    options.onSubmit(formValues)
                }
                // th submit với hành vi mạc Định
                else{
                    formElement.submit();
                }
            }
        }

        // Xử Lí Lặp Qua mỗi rule và xử lí(lắng nghe blur , input)
        options.rules.forEach((rule)=>{

            // Lưu ljai các rules cho mõi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector]=[rule.test]
            }

            const inputElements  = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach((inputElement)=>{
                // Xử lí trường hợp blur khỏi input
                inputElement.onblur = function() {
                    validate(inputElement,rule)
                }
                // Xử lí mỗi khi người dùng nhập input
                inputElement.oninput = function() {
                    const errorElement = getParent(inputElement , options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText =''
                    getParent(inputElement , options.formGroupSelector).classList.remove('invalid')
                }
            })
        });
    }
}
// Định Nghĩa Cá rules
// Nguyên tắc của các rules
// 1.Khi có looci => Trả ra mesage lỗi
// 2.Khi hợp lệ => Không Trả ra cái gi cả(undefined)
Validator.isRequired = function(selector,message) {
    return {
        selector:selector,
        test: function(value){
            return value ? undefined :message|| 'Vui Lòng Nhập Trường Này'
        }
    };
}
Validator.isEmail = function(selector,message){
    return {
        selector:selector,
        test: function(value){
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ?undefined :message|| 'Trường Này Phải Là Email'
        }
    };
}

Validator.minLength = function(selector , min, message){
    return {
        selector:selector,
        test: function(value){
            return value.length>=min ? undefined :message|| `Vui Lòng Nhập Tối Thiểu ${min} Kí Tự`
        }
    };
}
Validator.isConfirmed = function(selector, getConfirmValue,message){
    return {
        selector:selector,
        test: function(value){
            return value === getConfirmValue( ) ? undefined : message|| 'Giá Trị Nhập Vào Không Chính Xác'
        }
    };
}