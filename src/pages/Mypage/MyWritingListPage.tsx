/* eslint-disable import/extensions */
import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header/Header';
import { AiOutlineLeft as LeftIcon } from 'react-icons/ai';

import { Link } from 'react-router-dom';
import PostI from '../../assets/img/post.png';
import MyPostDetail from '@/components/Post/MyPostDetail';
import { IconWrapper } from './MyInfoPage.styles';
import { PostBlock, TopBlock } from './MyWritingPage.styles';
import { useGetMyPostList } from '@/hooks/query/list/useGetMyPostList';
import { useRecoilValue } from 'recoil';
import { userState } from '@/atoms/user/userState';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import { useTimer } from '@/hooks/useTimer';

function MyWritingListPage() {
  const userInfo = useRecoilValue(userState);
  const myPostList = useGetMyPostList({ token: userInfo.accessToken, userId: userInfo.id });
  const time = useTimer();

  return (
    <>
      <Header
        Left={() => (
          <IconWrapper>
            <Link to="/">
              <LeftIcon size={30} color="#fff" />
            </Link>
          </IconWrapper>
        )}
      />
      <TopBlock>
        <img src={PostI} />
      </TopBlock>
      <PostBlock>
        {myPostList.data?.dtoList.map(list => (
          <MyPostDetail
            item={list}
            key={list.id}
            shopName={list.store}
            categoryId={list.categoryId}
            payment={list.deliveryFee}
            people={{
              total: list.peopleNum,
              current: 1,
            }}
            schoolName={list.schoolId}
            time={{
              left: dayjs(dayjs(time).diff(list.deadline)).format('h시간 mm분'),
              post: dayjs(list.deadline).format('A hh:mm'),
            }}
            id={list.id}
          />
        ))}
      </PostBlock>
      <BottomNavigation />
    </>
  );
}

export default MyWritingListPage;
