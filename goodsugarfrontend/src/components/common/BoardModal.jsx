import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Button, Row, Col,
  Input, Modal, ModalHeader, ModalBody, FormGroup, Label
} from "reactstrap";
import '../../styles/BoardModal.css'

  const initialForm = {
    status: '먹음', 
    title: '',
    contents: '',
    details: '',
    bloodSugarF: '',
    bloodSugarS: '',
    fastingGlu: '',
    exer: 'N',
    tasterating: 3,
    boardTypeId: 2
  };

function BoardModal({ isModal, modalViewToggle, createBoard, mode, updateData, updateIndex, updateBoard }) {
  const [inputCreate, setInputCreate] = useState(initialForm);
  const [inputUpdate, setInputUpdate] = useState({});

  useEffect(() => {
    if (mode === "update" && updateData) {
      // 혈당 수치가 하나라도 있으면 '먹음', 없으면 '먹고 싶다'로 판단
      const hasSugar = (updateData.bloodSugarF > 0 || updateData.bloodSugarS > 0 || updateData.fastingGlu > 0);
      setInputUpdate({ 
        ...updateData, 
        status: hasSugar ? '먹음' : '먹고 싶다' 
      });
    } else {
      setInputCreate(initialForm);
    }
  }, [isModal, mode, updateData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (mode === "create") {
      setInputCreate(prev => ({ ...prev, [name]: value }));
    } else {
      setInputUpdate(prev => ({ ...prev, [name]: value }));
    }
  };

  // 💡 중요: 현재 수정 중인지 등록 중인지에 따라 가져올 데이터를 미리 결정
  const data = mode === "create" ? inputCreate : inputUpdate;

  return (
    <Modal isOpen={isModal} toggle={modalViewToggle} centered={true} className="board-modal">
      <ModalHeader toggle={modalViewToggle}>
        {mode === "create" ? "새로운 간식 기록" : "간식 기록 수정"}
      </ModalHeader>
      <ModalBody>
        <Card className="my-2" border="primary" outline>
          <CardBody>
            {/* 1. 먹음/먹고싶다 선택 버튼 */}
            <FormGroup>
              <Label>게시글 종류</Label>
              <div className="d-flex gap-2 mb-3">
                <Button
                  color={data.status === '먹음' ? "primary" : "outline-secondary"}
                  onClick={() => {
                    const val = '먹음';
                    mode === "create" ? setInputCreate({...inputCreate, status: val}) : setInputUpdate({...inputUpdate, status: val});
                  }}
                  className="flex-fill"
                >
                  😋 먹음
                </Button>
                <Button
                  color={data.status === '먹고 싶다' ? "primary" : "outline-secondary"}
                  onClick={() => {
                    const val = '먹고 싶다';
                    mode === "create" ? setInputCreate({...inputCreate, status: val}) : setInputUpdate({...inputUpdate, status: val});
                  }}
                  className="flex-fill"
                >
                  🤤 먹고 싶다
                </Button>
              </div>
            </FormGroup>

            {/* 2. 공통 입력 영역 */}
            <FormGroup>
              <Label>제목</Label>
              <Input name="title" value={data.title || ""} onChange={handleInputChange} placeholder="어떤 간식인가요?" />
            </FormGroup>
            <FormGroup>
              <Label>내용</Label>
              <Input type="textarea" name="contents" value={data.contents || ""} onChange={handleInputChange} placeholder="상세 내용을 입력하세요." />
            </FormGroup>

            {/* 💡 3. 조건부 렌더링 - 이 아래는 '먹음'일 때만 '존재'하게 됩니다 */}
            {data.status === '먹음' ? (
              <div className="snack-details-area">
                <hr />
                <h5 className="mb-3">📈 혈당 및 맛 평가</h5>
                <Row>
                  <Col><Label>공복</Label><Input type="number" name="fastingGlu" value={data.fastingGlu || ""} onChange={handleInputChange} /></Col>
                  <Col><Label>1시간</Label><Input type="number" name="bloodSugarF" value={data.bloodSugarF || ""} onChange={handleInputChange} /></Col>
                  <Col><Label>2시간</Label><Input type="number" name="bloodSugarS" value={data.bloodSugarS || ""} onChange={handleInputChange} /></Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <Label>운동 여부</Label>
                      <Input type="select" name="exer" value={data.exer || "N"} onChange={handleInputChange}>
                        <option value="N">안함</option>
                        <option value="Y">함</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col>
                    <Row>
                      <Col><Label>맛 평가 ({data.tasterating || 3}점)</Label>
                      <Input type="range" name="tasterating" min="1" max="5" value={data.tasterating || 3} onChange={handleInputChange} /></Col>
                      <Col><Label>먹은 양</Label><Input placeholder="최대한 자세하게 적어주세요!" name="details" value={data.details || ""} onChange={handleInputChange} /></Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            ) : (
              // 먹고 싶다일 때만 보이는 안내 (여기에 아무것도 안 넣으면 그냥 공백이 됩니다)
              <div className="text-center py-3 text-muted border rounded mt-3">
                <small>기대되는 간식을 미리 기록해 보세요! 🤤</small>
              </div>
            )}

            {/* 4. 하단 버튼 */}
            <Row className="mt-4 text-center">
              <Col>
                <Button color={mode === "create" ? "success" : "primary"} 
                        onClick={() => mode === "create" ? createBoard(inputCreate) : updateBoard(inputUpdate, updateIndex)}>
                  {mode === "create" ? "등록" : "수정"}
                </Button>
                <Button color="secondary" onClick={modalViewToggle} className="ms-2">취소</Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </ModalBody>
    </Modal>
  );
}

export default BoardModal;