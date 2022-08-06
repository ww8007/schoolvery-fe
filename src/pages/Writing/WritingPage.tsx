/* eslint-disable import/extensions */
import Header from '@/components/Header/Header';
import {
  IconWrapper,
  Container,
  Input,
  InputBlock,
  NumInput,
  TextArea,
  FirstSection,
  SecondSection,
  ThirdSection,
  IconBlock,
  IconCenterBlock,
  TimeInput,
  TimeInputBlock,
  RawFlexWrapper,
  FlexWrapper,
  RawFlexTimeWrapper,
} from './WritingPage.styles';
import { AiOutlineLeft as LeftIcon } from 'react-icons/ai';
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPen } from 'react-icons/fa';
import { BsShop as Shop } from 'react-icons/bs';
import { BiCategory, BiMoney } from 'react-icons/bi';
import { MdLocationPin as Location } from 'react-icons/md';

import ModalPostCategory from '@/components/Modal/ModalPostCategory';
import colors from '@/constants/colors';
import { useRecoilValue } from 'recoil';
import { userState } from '@/atoms/user/userState';
import { categoryListState } from '@/atoms/list/categoryListState';

import { useWritingMutation } from '@/hooks/query/writing/useWritingMutation';
import Select from 'react-select';
import type {} from 'react-select';
import { BsFillPeopleFill } from 'react-icons/bs';

// dayjs
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { WritingFooter } from '@/components/Writing/WritingFooter';
import { useGetOnePostInformation } from '@/hooks/query/writing/useGetOnePostInformation';
import { useCheckWritingMode } from '@/hooks/componentHooks/writing/useCheckWritingMode';
import { usePutPostInformation } from '@/hooks/query/writing/usePutPostInfromation';
import { getQueryString } from '@/util/getQueryString';
import { PostData } from '@/interface/writing';
import { useDeleteOnePost } from '@/hooks/query/writing/useDeleteOnePost';
dayjs.locale('ko');

export interface WritingInfo {
  title: string;
  store: string;
  location: string;
  peopleNum: number;
  endHour: number;
  endMinute: number;
  deliveryFee: number;
  content: string;
  [prop: string]: unknown;
}
interface iOption {
  label: string;
  value: string;
}
export enum PageMode {
  Write = 'Write',
  Fix = 'Fix',
}

function WritingPage() {
  const navigate = useNavigate();
  const spanRef = useRef() as React.MutableRefObject<HTMLFormElement>;
  const [writingInfo, setWritingInfo] = useState<WritingInfo>({
    title: '',
    store: '',
    categoryId: '',
    location: '',
    peopleNum: 0,
    endHour: dayjs().hour() > 12 ? dayjs().hour() - 12 : dayjs().hour(),
    endMinute: dayjs().minute(),
    deliveryFee: 0,
    content: '',
  });

  const onChangePostData = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value, name } = e.target;
      setWritingInfo({
        ...writingInfo,
        [name]: value,
      });
    },
    [writingInfo]
  );

  const onCheckBlank = useCallback(
    (e: React.FocusEvent<HTMLFormElement, Element>) => {
      //useCheckBlank({ e, ref: spanRef, state: writingInfo });
    },
    [writingInfo, spanRef]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [isAM, setIsAM] = useState(dayjs().format('A'));
  const { title, store, location, peopleNum, endHour, endMinute, deliveryFee, content } = writingInfo;
  const userInfo = useRecoilValue(userState);
  const categoryList = useRecoilValue(categoryListState);

  const { search } = useLocation();

  // 페이지 모드 분리
  // 쓰기 모드, 수정 모드

  // 쓰기 모드
  const writingMutation = useWritingMutation();
  useEffect(() => {
    writingMutation.isSuccess && navigate('/');
  }, [writingMutation.isSuccess]);

  // 수정 모드

  const queryString = useMemo(() => getQueryString(search), [search]);

  const { data } = useGetOnePostInformation({ accessToken: userInfo.accessToken, postId: Number(queryString.id) });
  const [pageMode] = useCheckWritingMode({ search, data, setWritingInfo, setCategoryID });

  const putPostInformation = usePutPostInformation();

  const onSubmitWritingInfo = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const submitItems = ['title', 'store', 'location', 'peopleNum', 'endHour', 'endMinute', 'deliveryFee'];
      // submitItems.forEach(item => {
      //   if (!writingInfo[item].length) {
      //     setSubmit(false);
      //     const select = spanRef.current?.querySelector<HTMLElement>(`#${item}`);
      //     if (select && !writingInfo[item]) select.style.display = 'block';
      //   }
      // });

      const onFindCategoryId = (): string => {
        const id = categoryList.find(category => category.name === categoryName)?.id as string;
        return id;
      };
      const time = dayjs()
        .set('h', isAM === '오후' ? endHour + 12 : endHour)
        .set('m', endMinute)
        .toJSON();
      const data: PostData = {
        title: title,
        schoolId: userInfo.schoolId,
        userId: userInfo.id,
        store: store,
        categoryId: onFindCategoryId(),
        location: location,
        peopleNum,
        deadline: time,
        deliveryFee,
        content: content,
      };
      if (pageMode === PageMode.Write) writingMutation.mutate({ accessToken: userInfo.accessToken, postData: data });
      if (pageMode === PageMode.Fix) {
        data.id = Number(queryString.id);
        putPostInformation.mutate({ accessToken: userInfo.accessToken, postData: data });
      }
    },
    [writingInfo, userInfo, pageMode]
  );

  // 삭제하기
  const deletePostMutation = useDeleteOnePost({ accessToken: userInfo.accessToken, postId: Number(queryString.id) });

  const options = [
    { value: '오전', label: '오전' },
    { value: '오후', label: '오후' },
  ];

  const styles = {
    control: (provided: any, state: any) => ({
      ...provided,
      background: '#fff',
      borderColor: colors.mainColor,
      borderRadius: 7,
      minHeight: '45px',
      height: '45px',
      boxShadow: state.isFocused ? null : null,
      flex: 3,
    }),
    container: (base: any) => ({
      ...base,
      flex: 1,
    }),
  };

  return (
    <>
      <Header
        title="글 등록"
        Left={() => (
          <IconWrapper>
            <Link to="/">
              <LeftIcon size={30} color="#fff" />
            </Link>
          </IconWrapper>
        )}
      />
      <Container ref={spanRef} onBlur={onCheckBlank} onSubmit={onSubmitWritingInfo}>
        <FirstSection>
          <InputBlock>
            <IconBlock>
              <FaPen size={33} color={colors.mainColor} />
            </IconBlock>
            <Input
              defaultValue={title}
              name="title"
              placeholder={'게시글 제목'}
              onChange={onChangePostData}
              autoFocus={true}
              autoComplete="off"
            />
          </InputBlock>
          <InputBlock>
            <IconBlock>
              <Shop size={33} color={colors.mainColor} />
            </IconBlock>
            <Input
              defaultValue={store}
              name="store"
              placeholder={'주문할 매장을 입력해 주세요'}
              onChange={onChangePostData}
              autoComplete="off"
            />
          </InputBlock>
          <InputBlock>
            <IconBlock>
              <BiCategory size={33} color={colors.mainColor} />
            </IconBlock>
            <Input
              defaultValue={categoryName}
              name="categoryName"
              placeholder={'카테고리를 선택해 주세요'}
              onClick={() => setModalVisible(true)}
              autoComplete="off"
            />
          </InputBlock>
          <InputBlock>
            <IconBlock>
              <Location size={33} color={colors.mainColor} />
            </IconBlock>
            <Input
              defaultValue={location}
              name="location"
              placeholder={'배달을 받을 위치를 입력해 주세요'}
              onChange={onChangePostData}
              autoComplete="off"
            />
          </InputBlock>
          <InputBlock>
            <RawFlexTimeWrapper>
              <Select
                defaultValue={isAM === '오후' ? options[1] : options[0]}
                styles={styles}
                placeholder="오전"
                options={options}
                onChange={option => setIsAM((option as iOption).value)}
              />
              <TimeInputBlock>
                <TimeInput
                  placeholder={'0'}
                  name="endHour"
                  defaultValue={endHour}
                  onChange={onChangePostData}
                  autoComplete="off"
                />
                <p>:</p>
                <TimeInput
                  placeholder={'0'}
                  name="endMinute"
                  defaultValue={dayjs().format('mm')}
                  onChange={onChangePostData}
                  autoComplete="off"
                />
              </TimeInputBlock>
            </RawFlexTimeWrapper>
          </InputBlock>
        </FirstSection>

        <SecondSection>
          <FlexWrapper>
            <IconCenterBlock>
              <BsFillPeopleFill size={33} color={colors.mainColor} />
            </IconCenterBlock>
            <RawFlexWrapper>
              <NumInput
                // placeholder={'0'}
                name="peopleNum"
                type={'number'}
                pattern={'[0-9]*'}
                value={peopleNum}
                onChange={onChangePostData}
                autoComplete="off"
              />
              <p>명</p>
            </RawFlexWrapper>
          </FlexWrapper>

          <FlexWrapper>
            <RawFlexWrapper>
              <IconCenterBlock>
                <BiMoney size={33} color={colors.mainColor} />
              </IconCenterBlock>
              <NumInput
                placeholder={'0'}
                name="deliveryFee"
                type={'number'}
                pattern={'[0-9]*'}
                value={deliveryFee}
                onChange={onChangePostData}
                autoComplete="off"
              />
              <p>원</p>
            </RawFlexWrapper>
          </FlexWrapper>
        </SecondSection>

        <ThirdSection>
          <TextArea name="content" defaultValue={content} onChange={onChangePostData}></TextArea>
        </ThirdSection>
        <WritingFooter isEdit={Boolean(search.length)} deletePostMutation={deletePostMutation} />
        {/* <Post type="submit">글 등록</Post> */}
      </Container>
      <ModalPostCategory
        visible={modalVisible}
        setModalVisible={setModalVisible}
        setCategoryName={setCategoryName}
        setCategoryId={setCategoryID}
      />
    </>
  );
}

export default WritingPage;
