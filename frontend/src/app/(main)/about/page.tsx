"use client";

import { Card, Row, Col, Statistic, Avatar, Button } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  StarOutlined, 
  TrophyOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  GlobalOutlined,
  SafetyOutlined,
  RocketOutlined,
  CodeOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import Image from 'next/image';

const { Meta } = Card;

export default function AboutPage() {
  const stats = [
    {
      title: 'Geliştirilen Proje',
      value: 17,
      suffix: '',
      prefix: <RocketOutlined className="text-blue-500" />,
      color: '#3B82F6'
    },
    {
      title: 'Kullanılan Teknoloji',
      value: 8,
      suffix: '+',
      prefix: <CodeOutlined className="text-green-500" />,
      color: '#10B981'
    },
    {
      title: 'Kod Satırı',
      value: 5000,
      suffix: '+',
      prefix: <FileTextOutlined className="text-purple-500" />,
      color: '#8B5CF6'
    },
    {
      title: 'Geliştirme Süresi',
      value: 1,
      suffix: ' Hafta',
      prefix: <ClockCircleOutlined className="text-orange-500" />,
      color: '#F59E0B'
    }
  ];

  const values = [
    {
      icon: <CodeOutlined className="text-2xl text-green-500" />,
      title: 'Modern Teknolojiler',
      description: 'Next.js, TypeScript, Ant Design gibi güncel teknolojiler kullanıyorum.'
    },
    {
      icon: <RocketOutlined className="text-2xl text-blue-500" />,
      title: 'Hızlı Geliştirme',
      description: 'Verimli kod yazımı ve hızlı proje geliştirme odaklı çalışıyorum.'
    },
    {
      icon: <CheckCircleOutlined className="text-2xl text-purple-500" />,
      title: 'Kaliteli Kod',
      description: 'Temiz, okunabilir ve sürdürülebilir kod yazımına önem veriyorum.'
    },
    {
      icon: <UserOutlined className="text-2xl text-orange-500" />,
      title: 'Kullanıcı Deneyimi',
      description: 'Kullanıcı dostu arayüzler ve iyi UX tasarımı hedefliyorum.'
    }
  ];

  const teamMembers = [
    {
      name: 'Görkem Kurtkaya',
      position: 'Kurucu & CEO',
      avatar: '/pp.jpeg',
      description: 'Full-stack web geliştirici olarak modern teknolojiler kullanarak bu e-ticaret platformunu geliştirdim. Next.js, TypeScript, Ant Design ve Tailwind CSS gibi güncel teknolojileri projede aktif olarak kullandım.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Hakkımızda
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Merhaba! Ben Görkem Kurtkaya. Bu projeyi geliştirdim ve modern web teknolojileri 
            kullanarak e-ticaret platformu oluşturdum.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Proje Bilgileri
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Bu projede kullanılan teknolojiler ve geliştirme süreci hakkında bilgiler
              </p>
          </div>
          
          <Row gutter={[24, 24]}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    valueStyle={{ color: stat.color, fontSize: '2rem', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <TrophyOutlined className="text-4xl text-yellow-500" />
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Geliştirme Amacım
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Modern web teknolojileri kullanarak kullanıcı dostu ve işlevsel 
                  web uygulamaları geliştirmek. Her projede en iyi pratikleri 
                  uygulayarak kaliteli sonuçlar elde etmek.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Sürekli öğrenme ve gelişim odaklı yaklaşımla, güncel teknolojileri 
                  takip ederek projelerde uygulamak.
                </p>
              </div>
            </Col>
            
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <GlobalOutlined className="text-4xl text-blue-500" />
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Gelecek Hedeflerim
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Full-stack web geliştirici olarak kendimi geliştirmek, 
                  çeşitli projelerde deneyim kazanmak ve teknoloji dünyasında 
                  aktif rol almak.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Öğrendiğim teknolojileri gerçek projelerde uygulayarak 
                  pratik deneyim elde etmek ve portföyümü genişletmek.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Geliştirme Yaklaşımım
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Projelerde kullandığım yaklaşımlar ve önceliklerim
              </p>
          </div>
          
          <Row gutter={[24, 24]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ekip
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Bu projeyi geliştiren ekip üyesi hakkında detaylı bilgiler
              </p>
          </div>
          
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={16} md={12} lg={8}>
              <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                <div className="mb-4">
                  <Avatar 
                    size={80} 
                    src="/pp.jpeg"
                    className="border-4 border-blue-200"
                  />
                </div>
                <Meta
                  title={teamMembers[0].name}
                  description={
                    <div className="space-y-2">
                      <p className="text-blue-600 font-medium">{teamMembers[0].position}</p>
                      <p className="text-gray-600 text-sm">{teamMembers[0].description}</p>
                    </div>
                  }
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>


    </div>
  );
}
