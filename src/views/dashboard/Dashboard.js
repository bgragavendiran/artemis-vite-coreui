import React, { useEffect, useState } from 'react'
import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
} from '@coreui/react'
import axios from 'axios'
import { db, auth } from 'src/firebase' // Ensure Firebase auth is configured
import { ref, get, child } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'

const Dashboard = () => {
  const [plants, setPlants] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [inferenceResult, setInferenceResult] = useState(null)
  const [firebaseUid, setFirebaseUid] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUid(user.uid)
        fetchPlants()
      } else {
        console.log('User not authenticated')
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchPlants = async () => {
    const dbRef = ref(db)
    try {
      const snapshot = await get(child(dbRef, `images`))
      if (snapshot.exists()) {
        const data = snapshot.val()
        const plantData = Object.keys(data).map((plantName) => {
          const dates = Object.keys(data[plantName]).map((dateTime) => ({
            dateTime,
            images: Object.values(data[plantName][dateTime]).flatMap((folder) =>
              Object.values(folder),
            ),
            totalFlowers: Object.values(data[plantName][dateTime])
              .flatMap((folder) => Object.values(folder))
              .reduce((total, img) => total + (img.inference_count || 0), 0),
          }))
          const overallFlowerCount = dates.reduce((total, date) => total + date.totalFlowers, 0)
          return { name: plantName, dates, overallFlowerCount }
        })
        setPlants(plantData)
      } else {
        console.log('No data available')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const handleSingleInference = async () => {
    if (!selectedFile) {
      alert('Please select a file first.')
      return
    }

    const data = new FormData()
    data.append('file', selectedFile)
    data.append('firebase_uid', firebaseUid)
    data.append('secret_key', import.meta.env.VITE_SECRET_KEY)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SECRET_URL}/infer-from-upload`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      setInferenceResult(response.data) // Set the inference result
    } catch (error) {
      console.error('Error during inference:', error)
    } finally {
      setModalVisible(false) // Close modal after submission
    }
  }

  const handleBatchProcess = async (plantName) => {
    try {
      const data = {
        plant_name: plantName,
        firebase_uid: firebaseUid,
        secret_key: import.meta.env.VITE_SECRET_KEY,
      }

      const response = await axios.post(
        `${import.meta.env.VITE_SECRET_URL}/infer-from-firebase`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
      console.log(`Batch processing started for ${plantName}:`, response.data)
    } catch (error) {
      console.error(`Error during batch processing for ${plantName}:`, error)
    }
  }

  return (
    <CContainer fluid>
      {/* Top Row Cards */}
      <CRow className="mb-4">
        <CCol xs={4}>
          <CCard color="primary" textColor="white">
            <CCardBody>
              <h5>Total Plants</h5>
              <p>{plants.length}</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={4}>
          <CCard color="info" textColor="white">
            <CCardBody>
              <h5>Total Images</h5>
              <p>
                {plants.reduce(
                  (total, plant) =>
                    total +
                    plant.dates.reduce(
                      (dateTotal, date) => dateTotal + (date.images ? date.images.length : 0),
                      0,
                    ),
                  0,
                )}
              </p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={4}>
          <CCard color="success" textColor="white">
            <CCardBody>
              <h5>Single Image Process</h5>
              <CButton color="light" size="sm" onClick={() => setModalVisible(true)}>
                Single Image Inference
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Accordion for Plants and Dates */}
      <CAccordion flush alwaysOpen>
        {plants.map((plant, plantIndex) => (
          <CAccordionItem key={plantIndex} itemKey={plantIndex}>
            <CAccordionHeader>
              <span>{plant.name}</span>
              <span className="ms-auto">Total Flowers: {plant.overallFlowerCount}</span>
            </CAccordionHeader>
            <CAccordionBody>
              {plant.dates.map((date, dateIndex) => (
                <CAccordion key={dateIndex}>
                  <CAccordionItem itemKey={dateIndex}>
                    <CAccordionHeader>
                      <span>
                        {new Date(
                          `${date.dateTime.slice(0, 4)}-${date.dateTime.slice(4, 6)}-${date.dateTime.slice(6, 8)}T${date.dateTime.slice(9, 11)}:${date.dateTime.slice(11, 13)}:${date.dateTime.slice(13)}`,
                        ).toLocaleString()}
                      </span>
                      <span className="ms-auto">Total Flowers: {date.totalFlowers}</span>
                      <CButton
                        color="primary"
                        className="ms-3"
                        onClick={() => handleBatchProcess(plant.name)}
                      >
                        Batch Process
                      </CButton>
                    </CAccordionHeader>
                    <CAccordionBody>
                      <CRow xs={{ cols: 2 }} md={{ cols: 4 }} lg={{ cols: 6 }}>
                        {date.images.map((image, imgIndex) => (
                          <CCol key={imgIndex} className="mb-3">
                            <div className="border rounded overflow-hidden">
                              <img
                                loading="lazy"
                                src={image.url}
                                alt="Plant"
                                style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                              />
                              <p>Flowers: {image.inference_count || 0}</p>
                            </div>
                          </CCol>
                        ))}
                      </CRow>
                    </CAccordionBody>
                  </CAccordionItem>
                </CAccordion>
              ))}
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>

      {/* Modal for Single Image Inference */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Single Image Inference</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput type="file" onChange={handleFileChange} />
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSingleInference}>
            Submit
          </CButton>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Display Inference Result */}
      {inferenceResult && (
        <CModal visible onClose={() => setInferenceResult(null)}>
          <CModalHeader>
            <CModalTitle>Inference Result</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <pre>{JSON.stringify(inferenceResult, null, 2)}</pre>
          </CModalBody>
          <CModalFooter>
            <CButton color="primary" onClick={() => setInferenceResult(null)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </CContainer>
  )
}

export default Dashboard
