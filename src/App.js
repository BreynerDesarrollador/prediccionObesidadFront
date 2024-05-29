import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import StepWizard from "react-step-wizard";
import Nav from './components/nav';
import Plugs from './components/Plugs';

import styles from './sass/wizard.less';
import './sass/transitions.css';

var host = "http://localhost:8080/";
const MySweetAlert = withReactContent(Swal);
const PrediccionObesidad = () => {
    var [formData, setFormData] = useState({
        genero: '',
        edad: '',
        altura: '',
        peso: '',
        family_history_with_overweight: '',
        consumo_alimento_calorico: '',
        cantidad_verdura: '',
        num_comida_dia: '',
        alimento_entre_comida: '',
        fuma: '',
        cant_agua_dia: '',
        controla_calorias: '',
        frecuencia_act_fisica: '',
        frecuencia_alcohol: '',
        medio_transporte: '',
        titulo: '',
        tipoAlgoritmo: 'J48'
    });
    const [cargando, setCargando] = useState(false);
    const datosFrecuencia = [{valor: 'Always', nombre: "Siempre"}, {
        valor: 'Frequently', nombre: "Frecuentemente"
    }, {valor: 'no', nombre: "No"}, {valor: 'Sometimes', nombre: "A veces"}];
    const datosTransporte = [{valor: 'Automobile', nombre: "Automovil"}, {
        valor: 'Bike', nombre: "Bicicleta"
    }, {valor: 'Motorbike', nombre: "Moto"}, {
        valor: 'Public_Transportation', nombre: "Transporte público"
    }, {valor: 'Walking', nombre: "Caminar"},];

    const [datos, setDatos] = useState('');

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const consultarPrediccionObesidad = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const response = await axios.post(host + 'predecirObesidad', formData);
            setDatos(response.data);
            setCargando(false);
            consultarRespuestaChatGpt(response.data.datos.obeso).then(res => {
                handleObesityResponse(response.data.datos, mensaje);
            });

        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };
    const [state, updateState] = useState({
        form: {}, transitions: {
            enterRight: `animated`,
            enterLeft: `animated`,
            exitRight: `animated`,
            exitLeft: `animated`,
            intro: `animated`,
        }, demo: true, // uncomment to see more
    });

    const updateForm = (key, value) => {
        const {form} = state;

        form[key] = value;
        updateState({
            ...state, form,
        });
    };

    // Do something on step change
    const onStepChange = (stats) => {
        // console.log(stats);
    };

    const setInstance = SW => updateState({
        ...state, SW,
    });
    const [mensaje, setMensaje] = useState('');
    const consultarRespuestaChatGpt = async (estadoObesidad) => {
        const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

        const prompt = {
            role: "user",
            content: 'Hola como estas ?',
        };
        const data = {
            "model": "gpt-3.5-turbo-instruct",
            "prompt": "Me puedes dar una recomendación de una persona con estado de obesidad " + estadoObesidad,
            max_tokens: 50,
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        try {
            const res = await axios.post('https://api.openai.com/v1/chat/completions', data, {headers: headers});
            setMensaje(res.data.choices[0]);
            console.log(res.data);
        } catch (error) {
            setMensaje(error.response.data.error.message);
        }
    };
    const handleObesityResponse = (datos, mensaje) => {
        MySweetAlert.fire({
            title: 'Respuesta sobre obesidad',
            html: (
                <div className="custom-modal-content animate__animated animate__fadeInUp">
                    <div className="result-container">
                        <p className="result-label">Promedio:</p>
                        <p className="result-value">{Math.round(datos.promedio * 100)} %</p>
                    </div>
                    <div className="result-container">
                        <p className="result-label">Resultado obesidad:</p>
                        <p className="result-value">{datos.obeso}</p>
                    </div>
                    <div className="result-container">
                        <p className="result-label">Predicción:</p>
                        <p className="result-value">{datos.prediccion}</p>
                    </div>
                    <div className="result-container">
                        <p className="result-label">¿ Puede ser obeso en el futuro ?</p>
                        <p className="result-value"> {datos.prediccion>1? 'Sí' : 'No'}</p>
                    </div>
                    <div className="recommendations">
                        <h3>Recomendaciones:</h3>
                        <ul>
                            <li>
                                <i className="fas fa-utensils"></i> Llevar una dieta equilibrada y nutritiva
                            </li>
                            <li>
                                <i className="fas fa-running"></i> Hacer ejercicio regularmente
                            </li>
                            <li>
                                <i className="fas fa-weight"></i> Mantener un peso saludable
                            </li>
                            <li>
                                <i className="fas fa-user-md"></i> Consultar a un profesional de la salud si es
                                necesario
                            </li>
                        </ul>
                    </div>
                    <div className="recommendations">
                        <h3>Recomendaciones de ChatGpt:</h3>
                        <ul>
                            <li>
                                <i className="fas fa-utensils"></i>{mensaje}
                            </li>
                        </ul>
                    </div>
                    <div className="recommendations">
                        <h3>Significado de los resultados:</h3>
                        <ul>
                            <li>"Insufficient_Weight" o "Bajo peso insalubre": Esta categoría indica un peso corporal por debajo de lo recomendado para la estatura, lo que se considera potencialmente perjudicial para la salud.</li>
                            <li>"Normal_Weight" o "Peso normal": Esta categoría representa un peso corporal dentro del rango considerado saludable para la estatura.</li>
                            <li>"Overweight_Level_I" o "Sobrepeso nivel I": Esta categoría indica un exceso de peso leve por encima del rango normal.</li>
                            <li>"Overweight_Level_II" o "Sobrepeso nivel II": Esta categoría representa un nivel más alto de exceso de peso que el nivel I.</li>
                            <li>"Obesity_Type_I" o "Obesidad tipo I": Esta categoría se refiere a un grado moderado de obesidad, donde el peso corporal excede significativamente el rango saludable.</li>
                            <li>"Obesity_Type_II" o "Obesidad tipo II": Esta categoría indica un grado más severo de obesidad que el tipo I.</li>
                            <li>"Obesity_Type_III" o "Obesidad tipo III": Esta categoría representa el grado más extremo de obesidad, donde el exceso de peso corporal es muy alto y potencialmente peligroso para la salud.</li>
                        </ul>
                    </div>
                </div>
            ),
            showConfirmButton: false,
            showCloseButton: true,
            allowOutsideClick: false,
            didOpen: () => {
                MySweetAlert.showLoading();
                /*const animationDiv = document.querySelector('.swal2-animate');
                animationDiv.classList.add('animate__animated', 'animate__zoomIn');*/
                setTimeout(() => {
                    MySweetAlert.hideLoading();
                }, 500);
            },
            customClass: {
                popup: 'custom-modal',
                header: 'custom-modal-header',
                title: 'custom-modal-title',
                closeButton: 'custom-close-button',
                content: 'custom-modal-content',
            },
        });
    };
    const {SW, demo} = state;
    return (

        <div className="container mt-5">
            <div className='row text-center'>
                <h3>Predicción de Obesidad</h3>
                <div className={'jumbotron'}>

                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-md-8 imgFondo">
                    <div className="card">
                        <div className="card-body">
                            <form className="needs-validation" onSubmit={consultarPrediccionObesidad}>
                                <div className='row'>
                                    <div
                                        className={`col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xs-12 mb-3 rsw-wrapper`}>
                                        <div className={'row d-flex justify-content-center'}>
                                            <div
                                                className={`col-sm-12 col-md-4 col-lg-4 col-xl-4 col-xs-4 mb-3 rsw-wrapper`}>
                                                <label>Tipo algoritmo</label>
                                                <select onChange={handleChange} id={'tipoAlgoritmo'}
                                                        name={'tipoAlgoritmo'}
                                                        className={'form-control form-control-sm'}>
                                                    <option value={'J48'}>J48</option>
                                                    <option value={'NAIVEBAYES'}>Naives Bayes</option>
                                                </select>
                                            </div>
                                        </div>

                                    </div>
                                    <div
                                        className={`col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xs-12 mb-3 rsw-wrapper`}>
                                        <StepWizard
                                            onStepChange={onStepChange}
                                            isHashEnabled
                                            transitions={state.transitions}
                                            nav={<Nav/>}
                                            instance={setInstance}
                                        >
                                            <Sexo hashKey={'Datos del sexo'} setFormData={setFormData}
                                                  handleChange={handleChange} formData={formData}/>
                                            <DatosBasicos hashKey={'Datos básicos'} form={state.form}
                                                          formData={formData}
                                                          setFormData={setFormData} handleChange={handleChange}/>
                                            <DatosAlimentacion hashKey={'Datos alimenticios'} form={state.form}
                                                               formData={formData}
                                                               setFormData={setFormData} handleChange={handleChange}
                                                               datosFrecuencia={datosFrecuencia}/>
                                            <ActividadCotidiana hashKey={'Datos actividad cotidiana'} form={state.form}
                                                                formData={formData}
                                                                setFormData={setFormData} handleChange={handleChange}
                                                                datosFrecuencia={datosFrecuencia}
                                                                datosTransporte={datosTransporte}/>
                                            <OtrosDatos hashKey={'Otros datos'} form={state.form} formData={formData}
                                                        setFormData={setFormData} handleChange={handleChange}/>
                                        </StepWizard>
                                    </div>
                                </div>
                            </form>
                            {/*{datos && (<div className="mt-3 alert alert-info" role="alert">
                                <h3>Promedio: {Math.round(datos.datos.promedio * 100)} %</h3>
                                <h3>Resultado obesidad: {datos.datos.obeso}</h3>
                                <h3>Predicción: {datos.datos.prediccion}</h3>
                            </div>)}*/}
                        </div>
                    </div>
                </div>
            </div>
        </div>);
};
const Stats = ({
                   currentStep, firstStep, goToStep, lastStep, nextStep, previousStep, totalSteps, step, cargando,
               }) => (<div className={'col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xs-12 text-center'}>
    <hr/>
    {step > 1 && <button className='btn btn-default btn-block' type="button" onClick={previousStep}>Atras</button>}
    {step < totalSteps ?
        <button className='btn btn-primary btn-block' type="button" onClick={nextStep}>Continuar</button> :

        <button className="btn btn-primary" type="submit" disabled={cargando}>
            {!cargando ? (<span>Predecir obesidad</span>) : (<span>
                                                    <span className="spinner-grow spinner-grow-sm"
                                                          aria-hidden="true"></span>
                                                        <span role="status">Cargando...</span>
                                                    </span>)}
        </button>
    }
    {/*<hr/>
        <div style={{fontSize: '21px', fontWeight: '200'}}>
            <h4>Other Functions</h4>
            <div>Current Step: {currentStep}</div>
            <div>Total Steps: {totalSteps}</div>
            <button className='btn btn-block btn-default' onClick={firstStep}>First Step</button>
            <button className='btn btn-block btn-default' onClick={lastStep}>Last Step</button>
            <button className='btn btn-block btn-default' onClick={() => goToStep(2)}>Go to Step 2</button>
        </div>*/}
</div>);
/** Steps */

const Sexo = props => {
    const handleChange = (e) => {
        props.setFormData({...props.formData, [e.target.name]: e.target.value});
    };

    return (
        <div className={''}>
            <h3 className={'text-center'}>{props.hashKey}</h3>
            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xs-12 mb-3">
                <label className="form-label">
                    Seleccione el género:
                </label>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="genero" id="generoHombre"
                           value="Male" checked={props.formData.genero === 'Male'}
                           onChange={handleChange} required/>
                    <label className="form-check-label" htmlFor="generoHombre">
                        Hombre
                    </label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="genero" id="generoMujer"
                           value="Female" checked={props.formData.genero === 'Female'}
                           onChange={handleChange} required/>
                    <label className="form-check-label" htmlFor="generoMujer">
                        Mujer
                    </label>
                </div>
                <Stats step={1} {...props} />
            </div>
        </div>);
};

const DatosBasicos = props => {
    const handleChange = (e) => {
        props.setFormData({...props.formData, [e.target.name]: e.target.value});
    };
    const validate = () => {
        //if (confirm('Are you sure you want to go back?')) { // eslint-disable-line
        props.previousStep();
        //}
    };

    return (
        <div className={''}>
            <h3 className={'text-center'}>{props.hashKey}</h3>
            <div className={'row'}>
                <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4 col-xs-4 mb-3">
                    <label className="form-label">
                        Edad
                    </label>
                    <input className="form-control form-control-sm" type="number" name="edad" id="edad"
                           value={props.formData.edad}
                           onChange={handleChange} required/>
                </div>
                <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4 col-xs-4 mb-3">
                    <label className="form-label">
                        Altura
                    </label>
                    <input className="form-control form-control-sm" type="number" name="altura"
                           id="altura"
                           value={props.formData.altura}
                           onChange={handleChange} required/>
                </div>
                <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4 col-xs-4 mb-3">
                    <label className="form-label">
                        Peso
                    </label>
                    <input className="form-control form-control-sm" type="number" name="peso" id="peso"
                           value={props.formData.peso}
                           onChange={handleChange} required/>
                </div>
            </div>
            <Stats step={2} {...props}/>
        </div>);
};

const DatosAlimentacion = (props) => {
    const handleChange = (e) => {
        props.setFormData({...props.formData, [e.target.name]: e.target.value});
    };
    const validate = () => {
        //if (confirm('Are you sure you want to go back?')) { // eslint-disable-line
        props.previousStep();
        //}
    };

    return (
        <div className={''}>
            <h3 className={'text-center'}>{props.hashKey}</h3>
            <div className={'row'}>
                <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xs-4 mb-3">
                    <label className="form-label" htmlFor="cantidad_verdura">
                        ¿Sueles comer verduras en tus comidas?
                    </label>
                    <input className="form-control form-control-sm" type="number"
                           name="cantidad_verdura" id="cantidad_verdura"
                           value={props.formData.cantidad_verdura}
                           onChange={handleChange} required/>
                </div>
                <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xs-4 mb-3">
                    <label className="form-label" htmlFor="num_comida_dia">
                        ¿Cuántas comidas principales tienes al día?
                    </label>
                    <input className="form-control form-control-sm" type="number" name="num_comida_dia"
                           id="num_comida_dia"
                           value={props.formData.num_comida_dia}
                           onChange={handleChange} required/>
                </div>
                <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6 mb-3">
                    <label className="form-label" htmlFor="alimento_entre_comida">
                        ¿Comes algún alimento entre comidas?
                    </label>
                    <select class="form-control form-control-sm" name="alimento_entre_comida"
                            id="alimento_entre_comida"
                            value={props.formData.alimento_entre_comida}
                            onChange={handleChange} required>
                        <option value="">...Seleccione...</option>
                        {props.datosFrecuencia.map((val, index) => (
                            <option key={val.valor} value={val.valor}>{val.nombre}</option>))}
                    </select>
                </div>
                <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6 mb-3">
                    <label className="form-label" htmlFor="cant_agua_dia">
                        ¿Cuánta agua bebes diariamente?
                    </label>
                    <input className="form-control form-control-sm" type="number" name="cant_agua_dia"
                           id="cant_agua_dia"
                           value={props.formData.cant_agua_dia}
                           onChange={handleChange} required/>
                </div>
            </div>
            <Stats step={3} {...props}/>
        </div>);
};
const ActividadCotidiana = (props) => {
    const handleChange = (e) => {
        props.setFormData({...props.formData, [e.target.name]: e.target.value});
    };
    const validate = () => {
        //if (confirm('Are you sure you want to go back?')) { // eslint-disable-line
        props.previousStep();
        //}
    };

    return (
        <div className={''}>
            <h3 className={'text-center'}>{props.hashKey}</h3>
            <div className={'row'}>
                <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4 col-xs-4 mb-3">
                    <label className="form-label" htmlFor="frecuencia_act_fisica">
                        ¿Con qué frecuencia realiza actividad física?
                    </label>
                    <input className="form-control form-control-sm" type="number"
                           name="frecuencia_act_fisica" id="frecuencia_act_fisica"
                           value={props.formData.frecuencia_act_fisica}
                           onChange={handleChange} required/>
                </div>
                <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4 col-xs-4 mb-3">
                    <label className="form-label" htmlFor="frecuencia_alcohol">
                        ¿Con qué frecuencia bebes alcohol?
                    </label>
                    <select className="form-control form-control-sm" name="frecuencia_alcohol"
                            id="frecuencia_alcohol"
                            value={props.formData.frecuencia_alcohol}
                            onChange={handleChange} required>
                        <option value="">...Seleccione...</option>
                        {props.datosFrecuencia.map((val, index) => (
                            <option key={val.valor} value={val.valor}>{val.nombre}</option>))}
                    </select>
                </div>
                <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4 col-xs-4 mb-3">
                    <label className="form-label" htmlFor="medio_transporte">
                        ¿Qué medio de transporte utilizas habitualmente?
                    </label>
                    <select className="form-control form-control-sm" name="medio_transporte"
                            id="medio_transporte"
                            value={props.formData.medio_transporte}
                            onChange={handleChange} required>
                        <option value="">...Seleccione...</option>
                        {props.datosTransporte.map((val, index) => (
                            <option key={val.valor} value={val.valor}>{val.nombre}</option>))}
                    </select>
                </div>
            </div>
            <Stats step={4} {...props}/>
        </div>);
};
const OtrosDatos = (props) => {
    const handleChange = (e) => {
        props.setFormData({...props.formData, [e.target.name]: e.target.value});
    };
    const submit = () => {
        alert('You did it! Yay!') // eslint-disable-line
    };

    return (
        <div className={''}>
            <h3 className={'text-center'}>{props.hashKey}</h3>
            <div className={'row'}>
                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xs-12 mb-3">
                    <label className="form-label">
                        ¿Algún miembro de la familia ha sufrido o sufre de sobrepeso?
                    </label>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                               name="family_history_with_overweight" id="family_history_with_overweight"
                               value="yes" checked={props.formData.family_history_with_overweight === 'yes'}
                               onChange={handleChange} required/>
                        <label className="form-check-label" htmlFor="family_history_with_overweight">
                            Sí
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                               name="family_history_with_overweight"
                               id="family_history_with_overweight2"
                               value="no" checked={props.formData.family_history_with_overweight === 'no'}
                               onChange={handleChange} required/>
                        <label className="form-check-label" htmlFor="generoMujer">
                            No
                        </label>
                    </div>
                </div>
                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xs-12 mb-3">
                    <label className="form-label">
                        ¿Comes alimentos con alto contenido calórico con frecuencia?
                    </label>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                               name="consumo_alimento_calorico" id="consumo_alimento_calorico"
                               value="yes" checked={props.formData.consumo_alimento_calorico === 'yes'}
                               onChange={handleChange} required/>
                        <label className="form-check-label" htmlFor="consumo_alimento_calorico">
                            Sí
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                               name="consumo_alimento_calorico"
                               id="consumo_alimento_calorico2"
                               value="no" checked={props.formData.consumo_alimento_calorico === 'no'}
                               onChange={handleChange} required/>
                        <label className="form-check-label" htmlFor="consumo_alimento_calorico2">
                            No
                        </label>
                    </div>
                </div>
                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xs-12 mb-3">
                    <label className="form-label">
                        ¿Fuma?
                    </label>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                               name="fuma" id="fuma"
                               value="yes" checked={props.formData.fuma === 'yes'}
                               onChange={handleChange} required/>
                        <label className="form-check-label" htmlFor="fuma">
                            Sí
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                               name="fuma"
                               id="fuma2"
                               value="no" checked={props.formData.fuma === 'no'}
                               onChange={handleChange} required/>
                        <label className="form-check-label" htmlFor="fuma2">
                            No
                        </label>
                    </div>
                </div>
                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xs-12 mb-3">
                    <label className="form-label">
                        ¿Controlas las calorías que comes diariamente?
                    </label>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                               name="controla_calorias" id="controla_calorias"
                               value="yes" checked={props.formData.controla_calorias === 'yes'}
                               onChange={handleChange} required/>
                        <label className="form-check-label" htmlFor="controla_calorias">
                            Sí
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                               name="controla_calorias"
                               id="controla_calorias2"
                               value="no" checked={props.formData.controla_calorias === 'no'}
                               onChange={handleChange} required/>
                        <label className="form-check-label" htmlFor="controla_calorias">
                            No
                        </label>
                    </div>
                </div>
            </div>
            {/*<Plugs/>*/}
            <Stats step={5} {...props} nextStep={submit}/>
        </div>);
};
export default PrediccionObesidad;
